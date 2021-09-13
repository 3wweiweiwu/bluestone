Invoke-RestMethod -Method Get -Uri "http://localhost:3600/spy" -TimeoutSec 60

$body=@{url="https://todomvc.com/examples/angularjs/#/"}

Invoke-RestMethod -Method Post -Uri "http://localhost:3600/api/record" -Body ($body)

