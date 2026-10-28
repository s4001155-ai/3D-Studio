3D Studio 5.3.1 RC — исправление отсутствующего studio-gateway.exe

ЭТО ИСХОДНЫЙ ПРОЕКТ ДЛЯ GITHUB ACTIONS, НЕ ГОТОВЫЙ УСТАНОВЩИК.

Причина ошибки: Windows Electron запускался, но не находил локальный сервер studio-gateway.exe.
Исправления:
- явная сборка gateway через python -m PyInstaller;
- проверка наличия и сигнатуры EXE до упаковки;
- проверка файла в dist/win-unpacked/resources/ после упаковки;
- GitHub Actions завершится ошибкой, если сервер не попал в пакет;
- более ясная диагностика в приложении.

Как получить установщик:
1. Распаковать ZIP.
2. Загрузить файлы и папки в корень репозитория 3D-Studio на GitHub,
   сохраняя .github/workflows/build-windows.yml.
3. Actions -> Build Windows EXE RC 5.3.1 -> Run workflow.
4. Убедиться, что все шаги зелёные, особенно Verify packaged gateway exists.
5. Скачать Artifacts -> 3D-Studio-5.3.1-Windows-RC-installer.
6. Распаковать и запустить файл Setup.

Не включайте Thingiverse App Token в исходники или EXE. Тестовая версия запрашивает токен вручную.
Публичная версия без ввода токена потребует защищённого облачного API.

ОГРАНИЧЕНИЕ: сам Windows установщик в этой среде не собран и не протестирован.
