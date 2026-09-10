@echo off
chcp 65001 >nul
title ClickCashier - Git Push to GitHub
color 0b
echo ===================================================================
echo            كليك كاشير (ClickCashier) - رفع المشروع إلى GitHub
echo ===================================================================
echo.
set "PATH=%LOCALAPPDATA%\MinGit\cmd;%PATH%"
cd /d "d:\al woagb"

echo [*] جاري التحقق من المستودع المحلي والملفات...
git status
echo.
echo [*] جاري الرفع إلى: https://github.com/hishamwesam13/-.git ...
echo.
echo -------------------------------------------------------------------
echo  ملاحظة هامة: إذا طلب منك GitHub تسجيل الدخول:
echo  1. Username: hishamwesam13
echo  2. Password: انسخ والصق رمز الـ Token الخاص بحسابك (وليس كلمة المرور العادية)
echo -------------------------------------------------------------------
echo.

git push -u origin main

echo.
echo ===================================================================
echo اكتملت العملية.
pause
