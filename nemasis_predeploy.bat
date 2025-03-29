@echo off
setlocal enabledelayedexpansion

:: Set API base URL
set API_BASE_URL=https://192.168.0.150:8183/api
set AUTH_TOKEN=56576214b49c5033

:: Perform Lookup
curl -X POST "%API_BASE_URL%/lookup" ^
  -H "accept: application/json" ^
  -H "Authorization: Bearer %AUTH_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"dig\": {\"url\": \"https://dev-escanai\", \"dnsIp\": \"8.8.8.8\"}}"
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

:: Set Authentication
curl -X POST "%API_BASE_URL%/setAuthentication" ^
  -H "accept: application/json" ^
  -H "Authorization: Bearer %AUTH_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"method\": {\"contextId\": \"1\", \"authMethodName\": \"formBasedAuthentication\", \"authMethodConfigParams\": \"loginUrl=http://dev-escanai&loginRequestData=username={%%username%%}&password={%%password%%}&username=ravindra@escanav.com&password=ravindra7a8a6a\"}, \"loggedInIndicatorRegex\": \"success\", \"loggedOutIndicatorRegex\": \"error\"}"
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

:: Start Spider Scan
curl -X POST "%API_BASE_URL%/spiderScan" ^
  -H "accept: application/json" ^
  -H "Authorization: Bearer %AUTH_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"scan\": {\"url\": \"http://dev-escanai\", \"maxChildren\": \"0\", \"recurse\": true, \"contextName\": \"\", \"subtreeOnly\": true, \"mode\": true, \"alertLimit\": 10000}, \"parametersActiveScan\": {\"recurse\": true, \"inScopeOnly\": false, \"scanPolicyName\": \"Default Policy\"}}"
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

endlocal
exit /b 0
