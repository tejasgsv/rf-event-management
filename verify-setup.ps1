Write-Host "`n SYSTEM VERIFICATION REPORT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Backend Server Check:" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:5001/diagnostics" -UseBasicParsing -ErrorAction Stop -TimeoutSec 3
    $diag = $resp.Content | ConvertFrom-Json
    Write-Host "   OK: Backend running on port 5001" -ForegroundColor Green
    Write-Host "   - Speakers: $($diag.speakersCount)" -ForegroundColor Green
    Write-Host "   - Events: $($diag.eventsCount)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Backend not responding" -ForegroundColor Red
}

Write-Host "`n2. Speaker Data Check:" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:5001/api/speakers" -UseBasicParsing -ErrorAction Stop -TimeoutSec 3
    $speakers = $resp.Content | ConvertFrom-Json
    Write-Host "   OK: $($speakers.Count) speakers loaded" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Could not load speakers" -ForegroundColor Red
}

Write-Host "`n3. Frontend API URL:" -ForegroundColor Yellow
$path = "d:\EVENT\rf-event-management\frontend\src\utils\apiClient.js"
$content = Get-Content $path -Raw
if ($content -match "5001") {
    Write-Host "   OK: Configured for port 5001" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Not using port 5001" -ForegroundColor Red
}

Write-Host "`nQUICK START:" -ForegroundColor Cyan
Write-Host "1. Backend running? If not: cd backend && node server.js" -ForegroundColor White
Write-Host "2. Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Browser: http://localhost:5173" -ForegroundColor White
Write-Host "`n" -ForegroundColor Cyan
