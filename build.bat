@echo off
REM Minify JavaScript
npx terser script.js -o script.min.js -c -m

REM Minify CSS
npx csso-cli style.css -o style.min.css

REM Create zip file
powershell -Command "Compress-Archive -Force -Path index.html,script.min.js,style.min.css,zzfx.min.js -DestinationPath cat-black-snack.zip"

echo Build complete. Files packaged in cat-black-snack.zip
