import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.scanner import run_security_scan
from app.pdf_report import generate_pdf

app = FastAPI(
    title="SecureLens Security Assessment API",
    description="Backend vulnerability scanning api for security headers, SSL/TLS certificates, open ports, and tech fingerprinting.",
    version="1.0.0"
)

# CORS configurations for React frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all. In production we would restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: str = Field(..., description="Target web URL to scan", example="https://example.com")

@app.post("/api/scan")
def scan_endpoint(request: ScanRequest):
    try:
        results = run_security_scan(request.url)
        return results
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except RuntimeError as run_err:
        raise HTTPException(status_code=502, detail=str(run_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected scanner error: {str(e)}")

@app.post("/api/scan/pdf")
def generate_pdf_endpoint(scan_data: dict):
    try:
        pdf_bytes = generate_pdf(scan_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=securelens_{scan_data.get('hostname', 'report')}_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "SecureLens API"}
