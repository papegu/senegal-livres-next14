$cwd = "C:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"
Set-Location $cwd
$ports = @(3000,3001)
$found = $null
for($i=0;$i -lt 30;$i++){
  foreach($p in $ports){
    $uri = "http://localhost:$p/"
    try {
      $r = Invoke-WebRequest -Uri $uri -Method Head -UseBasicParsing -TimeoutSec 3
      Write-Host "Port $p responded HTTP_$($r.StatusCode)"
      $found = $p
      break
    } catch {
      Write-Host "Port $p attempt $i: $($_.Exception.Message)"
    }
  }
  if($found){ break }
  Start-Sleep -s 1
}
if(-not $found){
  Write-Host 'No server responded on ports 3000 or 3001 within 30s; check the dev terminal for errors.'
  exit 2
} else {
  Write-Host "Server is responding on port $found"
}
