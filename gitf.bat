@echo off
cd /d "C:\Users\ivand\Documents\fansub"
set /p msg="Digite a mensagem do commit: "
git add .
git commit -m "%msg%"
git push origin main
pause
