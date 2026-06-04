# Script de Automação para Compilar o Aplicativo Android (.apk) Localmente
# Este script baixa e configura o Java JDK e o Android SDK localmente de forma automatizada.

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Iniciando a Configuração e Build do Android" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$workDir = Get-Location
$sdkDir = Join-Path $workDir "android-sdk"
$toolsDir = Join-Path $sdkDir "cmdline-tools"
$latestToolsDir = Join-Path $toolsDir "latest"

# 1. Verificar e Configurar Java JDK 21
Write-Host "[1/6] Verificando instalação do Java JDK 21..." -ForegroundColor Yellow
$javaInstalled = $false
try {
    $javaVer = java -version 2>&1
    if ($javaVer -match "21\.") {
        $javaInstalled = $true
        Write-Host "Java 21 já está instalado e no PATH." -ForegroundColor Green
    }
} catch {}

if (-not $javaInstalled) {
    # Procura em locais comuns de instalação do Eclipse Adoptium
    $commonAdoptiumPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium\jdk-21*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($commonAdoptiumPath) {
        $env:JAVA_HOME = $commonAdoptiumPath.FullName
        $env:Path += ";$($commonAdoptiumPath.FullName)\bin"
        Write-Host "Java 21 encontrado em: $($commonAdoptiumPath.FullName). Configurado JAVA_HOME." -ForegroundColor Green
    } else {
        Write-Host "Java 21 não encontrado. Instalando Eclipse Adoptium JDK 21 via Winget..." -ForegroundColor Yellow
        winget install EclipseAdoptium.Temurin.21.JDK --accept-source-agreements --accept-package-agreements
        
        # Recarregar PATH
        $commonAdoptiumPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium\jdk-21*" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($commonAdoptiumPath) {
            $env:JAVA_HOME = $commonAdoptiumPath.FullName
            $env:Path += ";$($commonAdoptiumPath.FullName)\bin"
            Write-Host "Java 21 instalado com sucesso!" -ForegroundColor Green
        } else {
            throw "Instalação do Java falhou ou requer reinicialização do terminal."
        }
    }
}

# 2. Baixar e Configurar Android SDK Command Line Tools
Write-Host "[2/6] Configurando Android SDK Command Line Tools..." -ForegroundColor Yellow
if (-not (Test-Path $latestToolsDir)) {
    Write-Host "Android SDK não encontrado localmente. Criando diretórios..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $sdkDir | Out-Null
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
    
    $zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    $zipPath = Join-Path $sdkDir "cmdline-tools.zip"
    
    Write-Host "Baixando cmdline-tools do repositório oficial da Google..." -ForegroundColor Yellow
    curl.exe -L -o $zipPath $zipUrl
    
    Write-Host "Extraindo arquivos do SDK..." -ForegroundColor Yellow
    # Cria uma pasta temporária para extração
    $tempExtract = Join-Path $sdkDir "temp_extract"
    Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force
    
    # Move para o formato correto esperado pelo sdkmanager: cmdline-tools/latest/
    Move-Item -Path (Join-Path $tempExtract "cmdline-tools") -Destination $latestToolsDir -Force
    Remove-Item -Path $tempExtract -Recurse -Force
    Remove-Item -Path $zipPath -Force
    Write-Host "Android SDK Command Line Tools instalado localmente em: $latestToolsDir" -ForegroundColor Green
} else {
    Write-Host "Android SDK Command Line Tools já está instalado." -ForegroundColor Green
}

# Configura as variáveis de ambiente locais do processo
$env:ANDROID_HOME = $sdkDir
$sdkManager = Join-Path $latestToolsDir "bin\sdkmanager.bat"

# 3. Aceitar Licenças do Android SDK
Write-Host "[3/6] Aceitando licenças do Android SDK..." -ForegroundColor Yellow
$licensesFile = Join-Path $sdkDir "licenses"
if (-not (Test-Path $licensesFile)) {
    Write-Host "Aceitando licenças..." -ForegroundColor Yellow
    $acceptCommand = "y`ny`ny`ny`ny`ny`ny`n"
    $acceptCommand | &$sdkManager --licenses
    Write-Host "Licenças do Android SDK aceitas!" -ForegroundColor Green
} else {
    Write-Host "Licenças do Android SDK já aceitas anteriormente." -ForegroundColor Green
}

# 4. Instalar Componentes do SDK Necessários (Platform 34, Build Tools 34.0.0, Platform Tools)
Write-Host "[4/6] Instalando pacotes do SDK (Platforms 34, Build-Tools 34, Platform-Tools)..." -ForegroundColor Yellow
&$sdkManager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 5. Sincronizar o projeto com o Capacitor
Write-Host "[5/6] Sincronizando código web com o Capacitor..." -ForegroundColor Yellow
npx cap sync

# 6. Compilar o APK com o Gradle
Write-Host "[6/6] Compilando APK via Gradle..." -ForegroundColor Yellow
cd android
# Atualiza local.properties para apontar para o SDK local
$localProperties = Join-Path (Get-Location) "local.properties"
$sdkPathEscaped = $sdkDir.Replace('\', '\\')
[System.IO.File]::WriteAllText($localProperties, "sdk.dir=$sdkPathEscaped`r`n")

Write-Host "Limpando compilações antigas com Gradle..." -ForegroundColor Yellow
cmd.exe /c "gradlew.bat clean --no-daemon"

Write-Host "Executando Gradle Wrapper (assembleDebug)..." -ForegroundColor Yellow
# O Gradle Wrapper gerencia e baixa a versão necessária do Gradle de forma autônoma
cmd.exe /c "gradlew.bat assembleDebug --no-daemon"

cd ..

# Copiar APK gerado para a raiz
$apkSource = Join-Path $workDir "android\app\build\outputs\apk\debug\app-debug.apk"
$apkDestination = Join-Path $workDir "As-Sagradas-Escrituras.apk"

if (Test-Path $apkSource) {
    Copy-Item -Path $apkSource -Destination $apkDestination -Force
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Sucesso! Aplicativo Android compilado." -ForegroundColor Green
    Write-Host "Arquivo salvo na raiz: As-Sagradas-Escrituras.apk" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    throw "Erro: O arquivo APK não foi gerado no caminho esperado."
}
