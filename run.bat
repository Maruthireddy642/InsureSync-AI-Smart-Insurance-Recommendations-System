@echo off
echo ===================================================
echo   Starting InsureSync AI (Backend + Frontend)
echo ===================================================

echo [1/2] Launching Backend on http://localhost:8000 ...
start "InsureSync Backend" cmd /k "cd backend && .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Frontend on http://localhost:5173 ...
start "InsureSync Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak > nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo ===================================================
echo   Both servers are running simultaneously!
echo   Keep the terminal windows open while using the app.
echo ===================================================
pause
