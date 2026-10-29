param([string]$Sdk = $env:ANDROID_HOME, [string]$Output = '')
$ErrorActionPreference = 'Stop'
if (-not $Sdk) { throw 'Set ANDROID_HOME or pass -Sdk with the Android SDK directory.' }
$Project = $PSScriptRoot
$Build = Join-Path $Project 'build'
$Tools = Join-Path $Sdk 'build-tools\34.0.0'
$AndroidJar = Join-Path $Sdk 'platforms\android-34\android.jar'
if (-not (Test-Path -LiteralPath $AndroidJar)) { throw 'Android SDK 34 not found; pass -Sdk with its directory.' }
function Check-Exit { if ($LASTEXITCODE -ne 0) { throw "Build command failed: $LASTEXITCODE" } }
node (Join-Path $Project 'build-web.cjs')
Check-Exit
foreach ($Dir in @('gen','classes','dex')) { New-Item -ItemType Directory -Force -Path (Join-Path $Build $Dir) | Out-Null }
& (Join-Path $Tools 'aapt2.exe') compile --dir (Join-Path $Project 'res') -o (Join-Path $Build 'resources.zip')
Check-Exit
& (Join-Path $Tools 'aapt2.exe') link -I $AndroidJar --manifest (Join-Path $Project 'AndroidManifest.xml') --java (Join-Path $Build 'gen') --min-sdk-version 26 --target-sdk-version 34 -A (Join-Path $Build 'assets') -o (Join-Path $Build 'unsigned.apk') (Join-Path $Build 'resources.zip')
Check-Exit
$JavaFiles = @((Join-Path $Project 'java\com\tianji\ziwei\MainActivity.java')) + @(Get-ChildItem -LiteralPath (Join-Path $Build 'gen') -Recurse -Filter *.java | Select-Object -ExpandProperty FullName)
javac -encoding UTF-8 -source 8 -target 8 -classpath $AndroidJar -d (Join-Path $Build 'classes') @JavaFiles
Check-Exit
$ClassFiles = @(Get-ChildItem -LiteralPath (Join-Path $Build 'classes') -Recurse -Filter *.class | Select-Object -ExpandProperty FullName)
& (Join-Path $Tools 'd8.bat') --lib $AndroidJar --min-api 26 --output (Join-Path $Build 'dex') @ClassFiles
Check-Exit
Push-Location (Join-Path $Build 'dex')
try { jar uf (Join-Path $Build 'unsigned.apk') classes.dex; Check-Exit } finally { Pop-Location }
& (Join-Path $Tools 'zipalign.exe') -f -p 4 (Join-Path $Build 'unsigned.apk') (Join-Path $Build 'aligned.apk')
Check-Exit
$Key = Join-Path $Build 'development.keystore'
if (-not (Test-Path -LiteralPath $Key)) {
    keytool -genkeypair -keystore $Key -storepass android -keypass android -alias androiddebugkey -dname 'CN=Android Debug,O=Android,C=US' -keyalg RSA -keysize 2048 -validity 10000
    Check-Exit
}
if (-not $Output) { $Output = Join-Path $Build 'tianji-ziwei.apk' }
& (Join-Path $Tools 'apksigner.bat') sign --ks $Key --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out $Output (Join-Path $Build 'aligned.apk')
Check-Exit
& (Join-Path $Tools 'apksigner.bat') verify --verbose $Output
Check-Exit
Write-Output $Output
