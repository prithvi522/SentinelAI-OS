import requests
import json
from pathlib import Path

base = 'http://127.0.0.1:8000'
session = requests.Session()

# Register (ignore errors)
try:
    r = session.post(f"{base}/api/v1/auth/register", json={"email":"ci@example.com","password":"CIpass@123","full_name":"CI User"})
    print('register', r.status_code, r.text)
except Exception as e:
    print('register failed', e)

# Login
r = session.post(f"{base}/api/v1/auth/login", json={"email":"ci@example.com","password":"CIpass@123"})
print('login', r.status_code, r.text)
if r.status_code != 200:
    raise SystemExit('login failed')
data = r.json()
token = data['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('token:', token)

# Create test file
p = Path(__file__).parent.parent / 'test_file.py'
p.write_text("print('hello')", encoding='utf-8')

# Upload file (multipart)
with open(p, 'rb') as fh:
    files = {'file': ('test_file.py', fh, 'text/x-python')}
    r = session.post(f"{base}/api/v1/security/scan-code", headers=headers, files=files)
    print('scan', r.status_code)
    print(r.text)
    if r.status_code == 200:
        scan = r.json()
        Path('..').joinpath('scan_result.json').write_text(json.dumps(scan, indent=2))
    else:
        scan = None

# Threat hunt
hunt_payload = {"logs": [{"timestamp":"2026-05-27T00:00:00Z","source_ip":"10.0.0.5","action":"login","status":"failed","user_agent":"Mozilla/5.0"}]}
r = session.post(f"{base}/api/v1/threats/hunt", headers=headers, json=hunt_payload)
print('hunt', r.status_code, r.text)
if r.status_code == 200:
    hunt = r.json()
    Path('..').joinpath('hunt_result.json').write_text(json.dumps(hunt, indent=2))

# Generate report (requires scan)
if scan:
    gen_payload = {"scanId": scan.get('scanId') if 'scanId' in scan else scan.get('id') if 'id' in scan else None, 'title':'CI Scan Report'}
    r = session.post(f"{base}/api/v1/reports/generate/vulnerability", headers=headers, json=gen_payload)
    print('generate', r.status_code, r.text)
    if r.status_code == 200:
        gen = r.json()
        Path('..').joinpath('gen_result.json').write_text(json.dumps(gen, indent=2))
        download_url = base + gen.get('downloadUrl') if gen.get('downloadUrl') else base + f"/api/v1/reports/download/{gen.get('reportId') or gen.get('id')}"
        r = session.get(download_url, headers=headers)
        if r.status_code == 200:
            Path('..').joinpath('report_ci.pdf').write_bytes(r.content)
            print('Downloaded report to', Path('..').joinpath('report_ci.pdf'))
    else:
        print('No scans to generate report')
else:
    print('Skipping report generation; no scan result')
