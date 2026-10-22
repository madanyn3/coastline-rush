$ErrorActionPreference='Stop'
$sdk=Join-Path $env:LOCALAPPDATA 'Android/Sdk'
$bt=Join-Path $sdk 'build-tools/34.0.0'
$jar=Join-Path $sdk 'platforms/android-34/android.jar'
$jdk='C:/Program Files/Eclipse Adoptium/jdk-17.0.17.10-hotspot/bin'
Set-Location $PSScriptRoot
if(Get-ChildItem ../coast-rush/dist -Filter '__qa*' -File){throw 'Remove temporary QA pages before building a release.'}
$releaseAssets=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'build/assets'))
$releaseRoot=[IO.Path]::GetFullPath($PSScriptRoot)+[IO.Path]::DirectorySeparatorChar
if(!$releaseAssets.StartsWith($releaseRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Unexpected build assets path'}
if(Test-Path -LiteralPath $releaseAssets){Remove-Item -LiteralPath $releaseAssets -Recurse -Force}
New-Item -ItemType Directory -Force build/classes,build/dex,build/assets | Out-Null
Copy-Item ../coast-rush/dist/* build/assets -Force -Recurse
(Get-Content build/assets/style.css -Raw) -replace "@import url\([^;]+;",'' | Set-Content build/assets/style.css -Encoding utf8
function Check {if($LASTEXITCODE -ne 0){throw "Build step failed: $LASTEXITCODE"}}
$sources=Get-ChildItem src -Recurse -Filter *.java | ForEach-Object FullName
& "$jdk/javac.exe" -source 8 -target 8 -bootclasspath $jar -d build/classes $sources
Check
$classes=Get-ChildItem build/classes -Recurse -Filter *.class | ForEach-Object FullName
& "$bt/d8.bat" --lib $jar --min-api 23 --output build/dex $classes
Check
& "$bt/aapt.exe" package -f -M AndroidManifest.xml -I $jar -S res -A build/assets -F build/unsigned.apk
Check
Copy-Item build/dex/classes.dex build/classes.dex -Force
Push-Location build
& "$bt/aapt.exe" add unsigned.apk classes.dex
Check
Pop-Location
& "$bt/zipalign.exe" -f 4 build/unsigned.apk build/aligned.apk
Check
if(!(Test-Path build/development.jks)){& "$jdk/keytool.exe" -genkeypair -keystore build/development.jks -storepass android -keypass android -alias coast-dev -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Coastline Rush Development';Check}
& "$bt/apksigner.bat" sign --ks build/development.jks --ks-pass pass:android --key-pass pass:android --out CoastlineRush.apk build/aligned.apk
Check
& "$bt/apksigner.bat" verify --verbose CoastlineRush.apk
Check
