@echo off
setlocal

cd /d "%~dp0"
set "PORT=8000"
set "URL=http://localhost:%PORT%/"

echo.
echo Starting Kodomo Yokai Zukan...
echo Project: %cd%
echo URL: %URL%
echo.

netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul 2>nul
if not errorlevel 1 goto open_existing

where py >nul 2>nul
if not errorlevel 1 (
  py -3 --version >nul 2>nul
  if not errorlevel 1 goto use_py
)

where python >nul 2>nul
if not errorlevel 1 (
  python --version >nul 2>nul
  if not errorlevel 1 goto use_python
)

where node >nul 2>nul
if not errorlevel 1 (
  node --version >nul 2>nul
  if not errorlevel 1 goto use_node
)

echo Python or Node.js was not found.
echo Install Python, then run this file again.
echo.
pause
exit /b 1

:open_existing
echo A local server already seems to be running on port %PORT%.
start "" "%URL%"
exit /b 0

:use_py
call :open_browser_later
echo Running: py -3 -m http.server %PORT%
echo Close this window to stop the server.
py -3 -m http.server %PORT%
goto end

:use_python
call :open_browser_later
echo Running: python -m http.server %PORT%
echo Close this window to stop the server.
python -m http.server %PORT%
goto end

:use_node
call :open_browser_later
echo Running: Node.js static server on port %PORT%
echo Close this window to stop the server.
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.normalize(path.join(root,u));if(!f.startsWith(root)){res.writeHead(403);res.end('forbidden');return;}fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);res.end('not found');return;}res.writeHead(200,{'content-type':types[path.extname(f).toLowerCase()]||'application/octet-stream'});res.end(b);});}).listen(8000,'127.0.0.1',()=>console.log('Open http://localhost:8000/'));"
goto end

:open_browser_later
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://localhost:8000/'"
exit /b 0

:end
echo.
echo Server stopped.
pause
