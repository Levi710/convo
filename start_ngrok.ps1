
# Start ngrok for backend
$ngrokPath = "C:\Users\ayush\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
Start-Process $ngrokPath -ArgumentList "http 8000"
Write-Host "Backend tunnel started on 8000. Copy the UUID url (e.g. https://xxxx.ngrok-free.app)"

# Instructions for user
Write-Host "---------------------------------------------------"
Write-Host "IMPORTANT: You need to start TWO tunnels for this to work publicly."
Write-Host "Since the free tier limits tunnels, simpler approach:"
Write-Host "1. Run 'ngrok http 8000'"
Write-Host "2. Copy the URL (e.g. https://cool-api.ngrok-free.app)"
Write-Host "3. Update web/app/page.tsx with this URL"
Write-Host "4. For the Frontend, you can just run '$ngrokPath http 3000' in a new terminal."
Write-Host "---------------------------------------------------"
