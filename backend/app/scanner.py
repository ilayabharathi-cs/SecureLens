import re
import socket
import ssl
from datetime import datetime, timezone
from urllib.parse import urlparse
import httpx
from cryptography import x509
from cryptography.hazmat.backends import default_backend

# Common ports we check
COMMON_PORTS = {
    80: "HTTP",
    443: "HTTPS",
    22: "SSH",
    21: "FTP",
    25: "SMTP",
    53: "DNS"
}

def normalize_url(url_str: str) -> dict:
    """
    Cleans up the user URL, returns protocol, hostname, port and target URL.
    """
    url_str = url_str.strip()
    if not url_str:
        raise ValueError("URL cannot be empty")
        
    # Standardize schema
    if not re.match(r'^https?://', url_str, re.IGNORECASE):
        # Default to https
        url_str = "https://" + url_str
        
    try:
        parsed = urlparse(url_str)
        hostname = parsed.hostname
        if not hostname:
            # Try to parse hostname without schema
            raise ValueError("Invalid URL format")
        
        # Simple regex check for valid domain/ip
        if not re.match(r'^[a-zA-Z0-9.\-_]+$', hostname):
            raise ValueError(f"Invalid hostname: {hostname}")
            
        scheme = parsed.scheme.lower()
        port = parsed.port
        if not port:
            port = 443 if scheme == "https" else 80
            
        return {
            "scheme": scheme,
            "hostname": hostname,
            "port": port,
            "url": parsed.geturl()
        }
    except Exception as e:
        raise ValueError(f"Failed to parse URL: {str(e)}")

def check_open_ports(hostname: str) -> list:
    """
    Checks common ports (80, 443, 22, 21, 25, 53) using socket connections.
    """
    results = []
    # Resolve hostname first
    try:
        ip = socket.gethostbyname(hostname)
    except socket.gaierror:
        # If DNS resolution fails, all ports are closed/unreachable
        for port, service in COMMON_PORTS.items():
            results.append({"port": port, "service": service, "status": "Closed/Filtered"})
        return results

    for port, service in COMMON_PORTS.items():
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.2) # short timeout to keep scan fast but reliable
        try:
            result = sock.connect_ex((ip, port))
            if result == 0:
                status = "Open"
            else:
                status = "Closed"
        except Exception:
            status = "Closed/Filtered"
        finally:
            sock.close()
            
        results.append({
            "port": port,
            "service": service,
            "status": status
        })
    return results

def inspect_ssl(hostname: str) -> dict:
    """
    Fetches and inspects the SSL certificate for the hostname on port 443.
    """
    ssl_info = {
        "valid": False,
        "expiry_date": None,
        "issuer": "Unknown",
        "subject": "Unknown",
        "tls_version": "Unknown",
        "days_left": 0,
        "error": None
    }
    
    # Check if host resolves
    try:
        socket.gethostbyname(hostname)
    except socket.gaierror:
        ssl_info["error"] = "DNS resolution failed"
        return ssl_info

    # 1. Try secure connection first
    context = ssl.create_default_context()
    cert_bin = None
    try:
        # Wrap connection in context
        sock = socket.create_connection((hostname, 443), timeout=4.0)
        sslsock = context.wrap_socket(sock, server_hostname=hostname)
        ssl_info["tls_version"] = sslsock.version()
        cert_bin = sslsock.getpeercert(binary_form=True)
        ssl_info["valid"] = True
        sslsock.close()
    except Exception as e:
        # Verification failed or connection failed. Let's retry without verification to parse details
        ssl_info["error"] = str(e)
        try:
            no_verify_context = ssl._create_unverified_context()
            sock = socket.create_connection((hostname, 443), timeout=4.0)
            sslsock = no_verify_context.wrap_socket(sock, server_hostname=hostname)
            ssl_info["tls_version"] = sslsock.version()
            cert_bin = sslsock.getpeercert(binary_form=True)
            sslsock.close()
        except Exception as fallback_e:
            # No SSL on port 443 or connection refused
            ssl_info["error"] = f"SSL Handshake failed: {str(e)}"
            return ssl_info

    # 2. Parse certificate details using cryptography
    if cert_bin:
        try:
            cert = x509.load_der_x509_certificate(cert_bin, default_backend())
            
            # Extract CN from Issuer
            issuer_cn = "Unknown"
            for attribute in cert.issuer:
                if attribute.oid == x509.NameOID.COMMON_NAME:
                    issuer_cn = attribute.value
                    break
            
            # Extract CN from Subject
            subject_cn = "Unknown"
            for attribute in cert.subject:
                if attribute.oid == x509.NameOID.COMMON_NAME:
                    subject_cn = attribute.value
                    break
            
            # Dates
            try:
                expiry_date = cert.not_valid_after_utc
            except AttributeError:
                expiry_date = cert.not_valid_after.replace(tzinfo=timezone.utc)
                
            now = datetime.now(timezone.utc)
            days_left = (expiry_date - now).days
            
            ssl_info["expiry_date"] = expiry_date.strftime("%Y-%m-%d %H:%M:%S UTC")
            ssl_info["issuer"] = issuer_cn
            ssl_info["subject"] = subject_cn
            ssl_info["days_left"] = days_left
            
            # If expired, mark as invalid
            if days_left <= 0:
                ssl_info["valid"] = False
                ssl_info["error"] = "Certificate is expired"
                
        except Exception as parse_err:
            ssl_info["error"] = f"Certificate parsed error: {str(parse_err)}"
            
    return ssl_info

def fingerprint_tech(headers: dict, html_content: str) -> list:
    """
    Fingerprints target technologies using response headers and HTML body analysis.
    """
    technologies = []
    
    # 1. Server Header Analysis
    server_header = headers.get("server", "").lower()
    x_powered_by = headers.get("x-powered-by", "").lower()
    
    if "nginx" in server_header:
        technologies.append({"name": "Nginx", "category": "Web Server", "confidence": "High"})
    elif "apache" in server_header:
        technologies.append({"name": "Apache", "category": "Web Server", "confidence": "High"})
    elif "cloudflare" in server_header:
        technologies.append({"name": "Cloudflare", "category": "CDN / WAF", "confidence": "High"})
        
    if "php" in x_powered_by or "php" in server_header:
        technologies.append({"name": "PHP", "category": "Programming Language", "confidence": "High"})
        
    # 2. Cloudflare specific headers
    if "cf-ray" in headers or "cf-cache-status" in headers:
        if not any(t["name"] == "Cloudflare" for t in technologies):
            technologies.append({"name": "Cloudflare", "category": "CDN / WAF", "confidence": "High"})
            
    # 3. HTML Content Analysis
    if html_content:
        # WordPress
        if "wp-content" in html_content or "wp-includes" in html_content or re.search(r'<meta name="generator" content="wordpress', html_content, re.I):
            technologies.append({"name": "WordPress", "category": "CMS", "confidence": "High"})
            
        # React
        if "react" in html_content or "_reactRootContainer" in html_content or "data-reactroot" in html_content:
            technologies.append({"name": "React", "category": "Frontend Framework", "confidence": "Medium"})
            
        # Check PHP file extensions in links or references
        if not any(t["name"] == "PHP" for t in technologies) and re.search(r'\.php[?/\s"]', html_content):
            technologies.append({"name": "PHP", "category": "Programming Language", "confidence": "Medium"})
            
    return technologies

def audit_headers(headers: dict) -> dict:
    """
    Checks for presence, value and risk level of key security headers.
    """
    # Key headers list
    header_rules = {
        "Content-Security-Policy": {
            "risk_if_missing": "High",
            "description": "Defends against Cross-Site Scripting (XSS) and data injection attacks by restricting resources the browser is allowed to load."
        },
        "Strict-Transport-Security": {
            "risk_if_missing": "Medium",
            "description": "Forces browser to connect using HTTPS, preventing SSL stripping and man-in-the-middle attacks."
        },
        "X-Frame-Options": {
            "risk_if_missing": "Medium",
            "description": "Protects users against Clickjacking attacks by controlling whether the site can be embedded in an iframe."
        },
        "X-Content-Type-Options": {
            "risk_if_missing": "Low",
            "description": "Prevents MIME-sniffing vulnerabilities, ensuring the browser respects the declared Content-Type header."
        },
        "Referrer-Policy": {
            "risk_if_missing": "Low",
            "description": "Controls how much referrer information is sent with requests, preventing sensitive data leakage in URLs."
        }
    }
    
    results = {}
    
    for header_name, rule in header_rules.items():
        # Case insensitive check
        found_key = next((k for k in headers.keys() if k.lower() == header_name.lower()), None)
        if found_key:
            value = headers[found_key]
            results[header_name] = {
                "status": "Present",
                "value": value,
                "risk": "Low",
                "description": rule["description"]
            }
        else:
            results[header_name] = {
                "status": "Missing",
                "value": None,
                "risk": rule["risk_if_missing"],
                "description": rule["description"]
            }
            
    return results

def compute_score_and_findings(headers_audit: dict, ssl_info: dict, ports_scan: list, response_headers: dict) -> tuple:
    """
    Computes security score out of 100 and returns detailed list of findings.
    """
    score = 100
    findings = []
    
    # 1. Headers findings & deductions
    for header, audit in headers_audit.items():
        if audit["status"] == "Missing":
            if audit["risk"] == "High":
                deduction = 15
            elif audit["risk"] == "Medium":
                deduction = 10
            else:
                deduction = 5
                
            score -= deduction
            findings.append({
                "category": "Security Headers",
                "severity": audit["risk"],
                "title": f"Missing {header} Header",
                "description": f"The '{header}' HTTP header was not found in the server response. {audit['description']}",
                "recommendation": f"Configure your web server to return the '{header}' header with a secure policy configuration."
            })
            
    # 2. SSL/TLS findings & deductions
    if not ssl_info["valid"]:
        # Certificate invalid or error
        score -= 35
        findings.append({
            "category": "SSL/TLS Security",
            "severity": "Critical",
            "title": "SSL/TLS Validation Failure",
            "description": f"SSL connection could not be fully trusted. Error details: {ssl_info['error'] or 'Invalid certificate'}.",
            "recommendation": "Configure a valid, trusted SSL/TLS certificate from a recognized Certificate Authority (like Let's Encrypt)."
        })
    else:
        # SSL exists and is valid, but let's check config details
        days_left = ssl_info.get("days_left", 0)
        if days_left < 7:
            score -= 20
            findings.append({
                "category": "SSL/TLS Security",
                "severity": "High",
                "title": "SSL Certificate Near Expiry",
                "description": f"The SSL certificate expires in {days_left} days ({ssl_info['expiry_date']}).",
                "recommendation": "Renew your SSL/TLS certificate immediately before it expires to prevent connection warnings."
            })
        elif days_left < 30:
            score -= 10
            findings.append({
                "category": "SSL/TLS Security",
                "severity": "Medium",
                "title": "SSL Certificate Expiry Looming",
                "description": f"The SSL certificate expires in {days_left} days.",
                "recommendation": "Plan to renew your SSL/TLS certificate soon to avoid service disruptions."
            })
            
        # TLS version audit
        tls_ver = ssl_info.get("tls_version", "")
        if "TLSv1.0" in tls_ver or "TLSv1.1" in tls_ver or "SSL" in tls_ver:
            score -= 20
            findings.append({
                "category": "SSL/TLS Security",
                "severity": "High",
                "title": f"Deprecating TLS Protocol Version: {tls_ver}",
                "description": "The site supports deprecated protocols (TLS 1.0, 1.1 or SSL). These versions are vulnerable to exploits like POODLE and BEAST.",
                "recommendation": "Disable TLS 1.0 and TLS 1.1 on your server configuration. Enable TLS 1.2 and TLS 1.3 only."
            })

    # 3. Information Disclosure (Server Headers / X-Powered-By)
    server_header = response_headers.get("server", "")
    if server_header:
        # If it reveals version info, e.g. Apache/2.4.41 (Ubuntu)
        if re.search(r'\d', server_header):
            score -= 5
            findings.append({
                "category": "Information Disclosure",
                "severity": "Low",
                "title": "Detailed Server Version Leak",
                "description": f"The 'Server' header exposes detailed software versions: '{server_header}'. Attackers can target specific CVEs.",
                "recommendation": "Modify your server configuration (e.g. ServerTokens ProductOnly for Apache or server_tokens off for Nginx) to hide version numbers."
            })
            
    x_powered_by = response_headers.get("x-powered-by", "")
    if x_powered_by:
        score -= 5
        findings.append({
            "category": "Information Disclosure",
            "severity": "Low",
            "title": "X-Powered-By Header Present",
            "description": f"The response contains the 'X-Powered-By' header value: '{x_powered_by}'. This leaks development framework details.",
            "recommendation": "Disable or remove the 'X-Powered-By' header in your application server settings."
        })

    # 4. Open Ports Risk Check (ftp/smtp/dns etc. shouldn't usually be open on public web servers)
    open_unusual_ports = []
    for port_info in ports_scan:
        if port_info["status"] == "Open" and port_info["port"] not in [80, 443]:
            open_unusual_ports.append(f"{port_info['service']} ({port_info['port']})")
            
    if open_unusual_ports:
        score -= 10
        findings.append({
            "category": "Infrastructure Configuration",
            "severity": "Medium",
            "title": f"Unusual Ports Exposed: {', '.join(open_unusual_ports)}",
            "description": f"Infrastructure exposes services other than standard web traffic (80/443). Active services: {', '.join(open_unusual_ports)}.",
            "recommendation": "Review your firewall settings. Restrict public access to SSH, FTP, SMTP, or DNS unless strictly required."
        })

    # Ensure score is within boundaries
    score = max(0, min(100, score))
    
    if score >= 90:
        risk_level = "Low"
    elif score >= 70:
        risk_level = "Medium"
    elif score >= 40:
        risk_level = "High"
    else:
        risk_level = "Critical"
        
    return score, risk_level, findings

def run_security_scan(target_url: str) -> dict:
    """
    Orchestrates the full URL scan.
    """
    normalized = normalize_url(target_url)
    hostname = normalized["hostname"]
    
    # 1. Connect and audit headers & technologies
    html_content = ""
    response_headers = {}
    actual_url = normalized["url"]
    
    try:
        # Perform standard HTTP/HTTPS request
        with httpx.Client(timeout=5.0, follow_redirects=True, verify=False) as client:
            # We verify=False to make sure we load even self-signed SSL sites to audit headers
            response = client.get(actual_url)
            response_headers = dict(response.headers)
            html_content = response.text
            actual_url = str(response.url)
    except Exception as e:
        # If HTTPS failed, try HTTP
        if normalized["scheme"] == "https":
            try:
                http_fallback_url = f"http://{hostname}"
                with httpx.Client(timeout=5.0, follow_redirects=True) as client:
                    response = client.get(http_fallback_url)
                    response_headers = dict(response.headers)
                    html_content = response.text
                    actual_url = str(response.url)
            except Exception as inner_e:
                raise RuntimeError(f"Could not connect to target {hostname}: {str(e)}")
        else:
            raise RuntimeError(f"Could not connect to target {hostname}: {str(e)}")

    # Audit the headers
    headers_audit = audit_headers(response_headers)
    
    # SSL/TLS Handshake Check
    ssl_info = inspect_ssl(hostname)
    
    # Safe ports check
    ports_scan = check_open_ports(hostname)
    
    # Technology Fingerprinting
    detected_tech = fingerprint_tech(response_headers, html_content)
    
    # Calculations
    score, risk_level, findings = compute_score_and_findings(headers_audit, ssl_info, ports_scan, response_headers)
    
    # Construct details object
    return {
        "url": actual_url,
        "hostname": hostname,
        "scan_date": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "score": score,
        "risk_level": risk_level,
        "ssl": ssl_info,
        "ports": ports_scan,
        "headers": headers_audit,
        "technologies": detected_tech,
        "findings": findings
    }
