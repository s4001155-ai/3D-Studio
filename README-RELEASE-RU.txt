3D Studio 0.4.0 Alpha — полный проект для GitHub

СОДЕРЖИМОЕ
- src/index.html: последняя браузерная версия с обучением для новичков, компактным меню ПКМ, настройками интерфейса, Quick Tools и Special Tools.
- src/pro-tools/: экспериментальные профессиональные инструменты.
- main.cjs: окно Electron.
- copy-vendor.cjs: локальная копия Three.js после npm install.
- package.json: конфигурация Electron Builder, Windows Setup и Portable.
- build/icon.ico: иконка приложения.
- .github/workflows/build-windows.yml: сборка Windows EXE через GitHub Actions.

КАК ЗАГРУЗИТЬ
1. Сохраните копию предыдущего рабочего репозитория.
2. Распакуйте ZIP и загрузите ВСЁ СОДЕРЖИМОЕ (не сам ZIP) в корень GitHub-репозитория.
3. Замените совпадающие файлы. Если остались старые src/app.js, src/language.js, src/ui-*.js, src/style.css, удалите их: текущий редактор теперь находится в src/index.html.
4. Проверьте скрытую папку .github/workflows; при необходимости обновите build-windows.yml вручную.
5. Commit changes → Actions → Build Windows EXE → Run workflow.
6. После успешной сборки скачайте Artifacts → 3D-Studio-Windows-Release и извлеките архив.
7. Установите Setup EXE (должен создать ярлык рабочего стола) или запустите Portable EXE.

ВАЖНО
Это ALPHA: синтаксис JavaScript проверен, но финальная Windows-сборка и корректность всех функций не проверены.
Не публикуйте как стабильную версию до проверки запуска, сохранения проектов, экспорта STL и работы языков.
Для macOS отдельная сборка НЕ включена. Её можно подготовить позже для тестировщика на Mac.
