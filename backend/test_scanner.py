import sys
from app.scanner import run_security_scan
from app.pdf_report import generate_pdf

def test_scanner():
    target = "google.com"
    print(f"[*] Starting local automated verification scan on target: {target}")
    try:
        results = run_security_scan(target)
        
        print("[+] Scan succeeded!")
        print(f"    - Scanned Hostname: {results['hostname']}")
        print(f"    - Risk Score: {results['score']}/100 ({results['risk_level']})")
        print(f"    - SSL Valid: {results['ssl']['valid']} (TLS: {results['ssl']['tls_version']})")
        print(f"    - Open Ports Checked: {len(results['ports'])}")
        print(f"    - Detected Tech: {[t['name'] for t in results['technologies']]}")
        print(f"    - Findings Found: {len(results['findings'])}")
        
        # Test PDF Report generation
        print("[*] Testing PDF generation...")
        pdf_bytes = generate_pdf(results)
        print(f"[+] PDF generation succeeded! Generated {len(pdf_bytes)} bytes.")
        
        return True
    except Exception as e:
        import traceback
        print("[-] Scan or PDF generation failed:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_scanner()
    sys.exit(0 if success else 1)
