@echo off
chcp 65001 >nul
echo ============================================
echo  个人博客系统 - 一键截图辅助脚本
echo ============================================
echo.
echo 即将在浏览器中依次打开以下页面，请用 Win+Shift+S 截图：
echo.
echo   1. 首页（文章列表）
echo   2. 文章详情页
echo   3. 归档页面
echo   4. 友链页面
echo   5. 统计概览 API
echo   6. 登录页面
echo   7. 关于页面
echo.
echo 按任意键开始...
pause >nul

start "" "http://localhost:5173"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173/article/56514faa-6092-4d3b-a1be-09d7596206a2"
timeout /t 1 /nobreak >nul
start "" "http://localhost:5173/archive"
timeout /t 1 /nobreak >nul
start "" "http://localhost:5173/links"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/api/stats/overview"
timeout /t 1 /nobreak >nul
start "" "http://localhost:5173/login"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/api/articles"

echo.
echo 所有页面已打开！请用 Win+Shift+S 逐个截图。
echo 截图保存到 screenshots/ 文件夹即可。
echo.
pause
