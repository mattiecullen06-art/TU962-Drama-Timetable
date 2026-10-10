# TU962 Drama timetable web app

Plain, responsive web app for iPhone, Android and laptops. Open `index.html` through an HTTPS host (not by double clicking the file). It contains the published TU962/3 snapshot with 224 dated sessions; weeks retain their actual dates and changing times. Published timetable changes are not automatically fetched. Personal changes stay in this browser until exported.

Timetable: browse weeks, add/edit/remove dates or repeating classes, hide classes, and undo the last change. Appearance: visual font/background/colour buttons and live preview. Instructions: import/export and phone setup instructions.

## iPhone

Install Scriptable from the App Store. Copy `widgets/TU962-Scriptable.js` into a new Scriptable script named TU962. Export the timetable JSON from the web app into Files, run the script and import it. Add a medium/large Scriptable home-screen widget and select TU962. Repeat export/import after edits. No signing or paid Apple developer account is needed. The script works from its imported local file without a server; iOS controls refresh times. Corners and some fonts differ from the browser preview. iPhone lock-screen widgets are not included.

## Android / KWGT

Use the app's **Export for KWGT** and the displayed formula to build a KWGT text widget. This is a manual design recipe, not a `.kwgt` preset. Set the widget time zone to Dublin. LockStar may host that widget on the lock screen depending on One UI / Good Lock versions. Phone testing is still required. The export includes exact daily schedules, room/type visibility, row limit, and compact spacing. Colours/fonts are selected inside KWGT; its display shows today's classes, without the iPhone next-day option. File access is subject to Android/KWGT permissions.

## GitHub Pages publishing

This repository contains only the TU962 web app and its widget helpers. Publish it free from a public repository: Settings → Pages → Deploy from a branch → main → / (root) → Save.

The website and its code are public. Each visitor's personal timetable edits remain in their own browser unless exported. Never commit personal backups to this repository.

## Checks

Run: node --test tests/*.test.mjs

Eleven tests cover schedules, recurrence, removals, imports, startup, KWGT daily exports and Scriptable API mock rendering. Physical phones and browser layout still require testing.

## First update

App dark mode has a separate saved preference. Widget appearance includes eighteen backgrounds, including transparent, and text uses DD/MM/YYYY dates. Android instructions apply to KWGT on Android phones; LockStar is an optional Samsung step. For the transparent iPhone style, select a matching wallpaper crop through the updated Scriptable script. This is a wallpaper matching effect, not live transparency.


