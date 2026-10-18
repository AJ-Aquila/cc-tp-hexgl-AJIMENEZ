@echo off
setlocal EnableExtensions DisableDelayedExpansion
rem HexGL QUnit - CMD autonome : aucune dependance PowerShell/Node.js.
rem Codes : 0=OK ; 1=ECHEC_TESTS ; 2=TESTS_IMPOSSIBLES.
set "SCRIPT_DIR=%~dp0"
set "HTML=%SCRIPT_DIR%index.html"
set "OUTPUT=%SCRIPT_DIR%rapport_erreur.html"
set "LOG=%TEMP%\hexgl-navigateur-%RANDOM%-%RANDOM%.log"
if exist "%OUTPUT%" del /q "%OUTPUT%" >nul 2>&1
if exist "%LOG%" del /q "%LOG%" >nul 2>&1
if not exist "%HTML%" (
 echo STATUT=TESTS_IMPOSSIBLES CODE=2
 set "REASON=Page index.html introuvable"
 call :write_error
 echo RAISON=Page index.html introuvable.
 echo ACTION=Verifier HexGL\formation\tests\index.html, sinon ouvrir la page manuellement.
 exit /b 2
)
set "BROWSER="
if not "%~1"=="" if exist "%~1" set "BROWSER=%~1"
if not defined BROWSER if defined CHROME_BIN if exist "%CHROME_BIN%" set "BROWSER=%CHROME_BIN%"
if not defined BROWSER if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%SystemDrive%\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "BROWSER=%SystemDrive%\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%SystemDrive%\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%SystemDrive%\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER for %%N in (chrome.exe msedge.exe chromium.exe) do if not defined BROWSER if not "%%~$PATH:N"=="" set "BROWSER=%%~$PATH:N"
if not defined BROWSER (
 echo STATUT=TESTS_IMPOSSIBLES CODE=2
 set "REASON=Chrome ou Edge introuvable"
 call :write_error
 echo RAISON=Chrome/Edge introuvable. Verification automatique impossible.
 echo ACTION=Ouvrir index.html dans le navigateur et communiquer le bilan QUnit a Claude.
 exit /b 2
)
set "TMPROOT=%TEMP%\hexgl-qunit-%RANDOM%-%RANDOM%"
mkdir "%TMPROOT%" >nul 2>&1
if errorlevel 1 (
 echo STATUT=TESTS_IMPOSSIBLES CODE=2
 set "REASON=Impossible de creer le dossier temporaire"
 call :write_error
 echo RAISON=Impossible de creer le dossier temporaire.
 echo ACTION=Ouvrir index.html manuellement.
 exit /b 2
)
set "PROFILE=%TMPROOT%\profile"
set "URL=file:///%HTML:\=/%?hexgl_poc=ok"
"%BROWSER%" --headless=new --no-first-run --no-default-browser-check --disable-gpu --disable-extensions --disable-dev-shm-usage --dump-dom --virtual-time-budget=5000 --user-data-dir="%PROFILE%" "%URL%" 1>"%OUTPUT%" 2>"%LOG%"
set "BROWSER_EXIT=%ERRORLEVEL%"
if not "%BROWSER_EXIT%"=="0" goto :unavailable
if not exist "%OUTPUT%" goto :unavailable
for %%F in ("%OUTPUT%") do if %%~zF EQU 0 goto :unavailable
rem L'attribut est pose par browser-tests.js uniquement quand QUnit.done() s'est termine.
findstr /R /C:"data-test-status=.pass." "%OUTPUT%" >nul 2>&1
if not errorlevel 1 goto :passed
findstr /R /C:"data-test-status=.fail." "%OUTPUT%" >nul 2>&1
if not errorlevel 1 goto :failed
goto :unavailable
:passed
echo STATUT=TESTS_REUSSIS CODE=0
echo SUCCES : QUnit termine, aucune assertion en echec.
if exist "%OUTPUT%" del /q "%OUTPUT%" >nul 2>&1
if exist "%LOG%" del /q "%LOG%" >nul 2>&1
rmdir /s /q "%TMPROOT%" >nul 2>&1
exit /b 0
:failed

echo STATUT=TESTS_ECHOUES CODE=1
echo ECHEC : QUnit a detecte une ou plusieurs assertions en echec.
echo RAPPORT=%OUTPUT%
if exist "%LOG%" del /q "%LOG%" >nul 2>&1
rmdir /s /q "%TMPROOT%" >nul 2>&1
echo ACTION=Corriger le code ou les tests et relancer.
exit /b 1
:unavailable
set "REASON=Navigateur bloque ou resultat QUnit absent ou incomplet"
call :write_error
if exist "%LOG%" del /q "%LOG%" >nul 2>&1
echo STATUT=TESTS_IMPOSSIBLES CODE=2
echo RAISON=%REASON%
echo RAPPORT=%OUTPUT%
rmdir /s /q "%TMPROOT%" >nul 2>&1
echo ACTION=Ouvrir index.html manuellement et communiquer le bilan QUnit a Claude.
exit /b 2

:write_error
>"%OUTPUT%" echo ^<!doctype html^>
>>"%OUTPUT%" echo ^<html lang="fr"^>
>>"%OUTPUT%" echo ^<head^>^<meta charset="utf-8"^>^<title^>HexGL - Tests impossibles^</title^>^</head^>
>>"%OUTPUT%" echo ^<body^>
>>"%OUTPUT%" echo ^<h1^>HexGL - Tests impossibles - code 2^</h1^>
>>"%OUTPUT%" echo ^<p^>%REASON%^</p^>
>>"%OUTPUT%" echo ^<p^>Aucun resultat de test ne doit etre considere comme valide.^</p^>
>>"%OUTPUT%" echo ^<p^>Ouvrez index.html manuellement et transmettez les resultats QUnit a Claude.^</p^>
>>"%OUTPUT%" echo ^</body^>^</html^>
exit /b 0
