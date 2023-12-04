python -m nuitka ^
--standalone ^
--onefile ^
--follow-imports ^
--include-data-dir=./gui=gui ^
--windows-icon-from-ico=favicon.ico ^
--windows-disable-console ^
--onefile-tempdir-spec="%TEMP%\\simux-temp" ^
--company-name="IFBA - Salvador" ^
--product-name="Simux" ^
--file-version="0.0.3" ^
--product-version="0.0.3" ^
--file-description="Simux" ^
--copyright="Copyright (c) 2023 - IFBA SSA" ^
--output-dir=".build" ^
-o Simux.exe src/main.py