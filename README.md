# 3D Studio — Windows EXE build

This is the **experimental** desktop packaging of 3D Studio with the seven special tools. The editor and STL export are still alpha-quality; test before printing.

## Get a Windows EXE without installing build tools locally

1. Create a GitHub repository (or a new branch of your existing repo) and upload **all the files and folders** from this archive, including `.github/workflows/windows-build.yml`.
2. Open **Actions** → **Build Windows EXE** → **Run workflow**.
3. Wait for the Windows build to finish successfully.
4. Open the completed workflow run and download **3D-Studio-Windows-EXE** from **Artifacts**.
5. Extract the artifact ZIP. It should contain the setup and portable `.exe` files.
6. Test both EXEs on Windows before publishing them in **Releases**.

If Actions is disabled, enable workflows for your repository. You may need to commit a `package-lock.json` after running `npm install` for reproducible builds.

## Build locally (developers only)

Install Node.js 22 or later and run:

```sh
npm install
npm run dist:win
```

## Important

- End users do **not** need Node.js, Python, PowerShell, or a local server.
- Three.js is bundled during the build; normal editing does not require downloading it at runtime.
- This is **not digitally signed**. Windows SmartScreen may show a warning. Do not disable Windows security protections.
- Browser projects are not automatically imported. Back up `.3dstudio` files and import them in the desktop version.
- Project autosave uses app-local browser storage. Keep independent backups.
- The seven special tools have not yet undergone full integration or print-safety testing.
