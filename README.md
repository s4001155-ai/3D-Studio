# 3D Studio 🎨

**A free, beginner-friendly 3D modeling tool for 3D printing.**

3D Studio is an open-source project in early development, created to make 3D modeling simpler and more intuitive.

The goal is to provide an accessible alternative for people who find traditional 3D modeling software too complicated.

## ✨ Features

- Create and edit 3D shapes
- Adjust dimensions in millimeters
- Move objects using a customizable grid
- Add 3D text in multiple languages
- Export models to STL
- Choose from different 3D printer profiles
- Estimate printing time
- Customize the interface
- Create, save, and manage projects
- Automatic project saving

## 💻 Installation (Windows)

3D Studio currently runs in your web browser using a local server.

**Step 1 — Download**

1. Click the green **Code** button on this GitHub page.
2. Select **Download ZIP**.
3. Extract the downloaded ZIP file.
4. Open the extracted folder containing `index.html` and `app.js`.

**Step 2 — Install Python**

If Python is not installed:

1. Visit https://www.python.org/downloads/
2. Download Python 3 for Windows.
3. Install it and make sure the Python launcher is available.

**Step 3 — Start 3D Studio**

1. Open the folder containing `index.html`.
2. Click the address bar in Windows File Explorer.
3. Type `powershell` and press Enter.
4. Enter the following command:

```powershell
py -m http.server 8765
```

5. Press Enter.

**Step 4 — Open the application**

Open your browser and visit:

http://127.0.0.1:8765/index.html

3D Studio should now start!

Keep the PowerShell window open while using the application.

To stop the server, press `Ctrl + C`.

## ⚠️ Important Notes

- This is an early alpha version. Bugs may occur.
- Python 3 is currently required to start the local server.
- Internet access is required to load some external 3D libraries.
- Projects are stored locally in your browser.
- Export important projects regularly to avoid losing your work.
- Printing time estimates are approximate.
- Always check exported STL files in your slicer before printing.

## 🌍 Languages

3D Studio currently includes:

- English
- Russian
- Chinese

Some parts of the interface may not yet be fully translated.

## 💡 Feedback and Suggestions

Your feedback is extremely valuable!

If you find a bug or have an idea for a new feature, please open a GitHub Issue.

We welcome suggestions about usability, modeling tools, interface design, and 3D printing features.

## 🚀 Project Status

**Version: 0.1.0 Alpha**

3D Studio is under active development.

Our goal is to build a simple, free, and accessible 3D modeling application together with the community.
