$base='http://127.0.0.1:8000'
Try {
  Invoke-RestMethod -Uri "$base/api/v1/auth/register" -Method POST -ContentType 'application/json' -Body (@{email='ci@example.com'; password='CIpass@123'; full_name='CI User'} | ConvertTo-Json) -ErrorAction Stop
} Catch {
  Write-Host "Register may exist or failed: $($_.Exception.Message)"
}
$login = Invoke-RestMethod -Uri "$base/api/v1/auth/login" -Method POST -ContentType 'application/json' -Body (@{email='ci@example.com'; password='CIpass@123'} | ConvertTo-Json)
$token = $login.access_token
Write-Host "LOGIN TOKEN: $token"
$testFilePath = '..\test_file.py'
"print('hello')" | Out-File -FilePath $testFilePath -Encoding utf8
$path = $testFilePath
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = New-Object System.Net.Http.MultipartFormDataContent
$fileContent = New-Object System.Net.Http.ByteArrayContent($bytes)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse('text/x-python')
$content.Add($fileContent, 'file', 'test_file.py')
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Add('Authorization', "Bearer $token")
$res = $client.PostAsync("$base/api/v1/security/scan-code", $content).Result
$body = $res.Content.ReadAsStringAsync().Result
try { $scan = $body | ConvertFrom-Json } catch { Write-Host 'Scan response not JSON:'; Write-Host $body; $scan = $null }
if ($scan) { $scan | ConvertTo-Json -Depth 5 | Out-File -FilePath '..\scan_result.json'; Write-Host 'SCAN:'; $scan | ConvertTo-Json -Depth 5 } else { Write-Host 'Scan failed or non-JSON response.' }
$huntBody = @{ logs = @(@{ timestamp = '2026-05-27T00:00:00Z'; source_ip='10.0.0.5'; action='login'; status='failed'; user_agent='Mozilla/5.0' }) } | ConvertTo-Json
$hunt = Invoke-RestMethod -Uri "$base/api/v1/threats/hunt" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $huntBody
$hunt | ConvertTo-Json -Depth 5 | Out-File -FilePath '..\hunt_result.json'
Write-Host 'HUNT:'; $hunt | ConvertTo-Json -Depth 5
$genBody = @{ scanId = $scan.scanId; title = 'CI Scan Report' } | ConvertTo-Json
$gen = Invoke-RestMethod -Uri "$base/api/v1/reports/generate/vulnerability" -Method POST -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -Body $genBody
$gen | ConvertTo-Json -Depth 5 | Out-File -FilePath '..\gen_result.json'
Write-Host 'GEN:'; $gen | ConvertTo-Json -Depth 5
$downloadUrl = "$base$($gen.downloadUrl)"
Invoke-WebRequest -Uri $downloadUrl -Headers @{ Authorization = "Bearer $token" } -OutFile '..\report_ci.pdf'
Write-Host 'Downloaded report to:' (Resolve-Path '..\report_ci.pdf')
