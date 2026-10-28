3D Studio — полное обновление для GitHub

Это полный проект с последними изменениями интерфейса и исправленной конфигурацией сборки EXE.
Содержит: src/, package.json, main.cjs, copy-vendor.cjs, .github/workflows/build-windows.yml.

Обновление:
1. Сохраните важные проекты и предыдущую рабочую версию.
2. В репозитории GitHub замените файлы src/, package.json, main.cjs, copy-vendor.cjs.
3. Проверьте, что workflow находится в .github/workflows/build-windows.yml.
4. Не создавайте второй workflow windows-build.yml: если он уже есть в репозитории, удалите его.
5. Commit changes → Actions → Build Windows EXE → Run workflow.
6. После успеха скачайте 3D-Studio-Windows-Release из Artifacts.

Примечание: при загрузке через веб-интерфейс GitHub скрытая папка .github может не загрузиться перетаскиванием.
В таком случае обновите .github/workflows/build-windows.yml через редактор GitHub.
Проверен синтаксис JS и JSON; сборка Windows и работа приложения в ней не проверены.
