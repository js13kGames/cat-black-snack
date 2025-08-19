min:
	npx terser script.js -o script.min.js -c -m
	npx csso-cli style.css -o style.min.css

zipW:
	powershell -Command "Compress-Archive -Force -Path index.html,script.min.js,style.min.css,zzfx.min.js -DestinationPath cat-black-snack.zip"