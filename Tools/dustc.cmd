@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\dustjs-linkedin\bin\dustc" %*
) ELSE (
  node  "%~dp0\node_modules\dustjs-linkedin\bin\dustc" %*
)