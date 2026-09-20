$path = Join-Path $PSScriptRoot "src\js\app.js"
$content = [System.IO.File]::ReadAllText($path)
$lines = $content -split "`n"
$i = 0
foreach ($line in $lines) {
    $i++
    $hasEmoji = $false
    foreach ($char in $line.ToCharArray()) {
        $code = [int][char]$char
        if ($code -gt 9000) { $hasEmoji = $true; break }
    }
    if ($hasEmoji) { Write-Host "${i}: $line" }
}
