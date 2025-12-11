
Write-Host "Starting Backend Tunnel (8000)..."
Start-Process npx -ArgumentList "-y localtunnel --port 8000" -NoNewWindow
Write-Host "Backend tunnel started in background."

Write-Host "Starting Frontend Tunnel (3000)..."
Start-Process npx -ArgumentList "-y localtunnel --port 3000" -NoNewWindow
Write-Host "Frontend tunnel started in background."

Write-Host "---------------------------------------------------"
Write-Host "NOTE: Localtunnel provides a public URL instantly."
Write-Host "You still need to find the URL printed in the new windows."
Write-Host "1. Copy the backend URL (e.g. https://sad-cat-42.loca.lt)"
Write-Host "2. Update web/app/page.tsx with it"
Write-Host "3. Open the frontend URL on your phone."
Write-Host "---------------------------------------------------"
