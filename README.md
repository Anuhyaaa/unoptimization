# FitTrack

FitTrack is a lightweight fitness web app for tracking daily movement and habits. It now uses a single routed entry point, a shared navigation/header shell, and centralized app state for steps, water, profile, and settings.

## Features

- Real-time step tracking on supported mobile browsers
- Water intake tracking with daily goals
- Weekly and progress summaries
- Distance and calorie estimates
- Daily motivation quotes
- Nutrition and profile pages
- Theme and app settings
- Service worker support for offline caching
- Gulp-based build pipeline for minifying and optimizing assets

## Navigation

The app now renders from `index.html` and uses hash routes for:

- `#home`
- `#steps`
- `#weekly`
- `#water`
- `#quotes`
- `#nutrition`
- `#profile`
- `#progress`
- `#distance`
- `#settings`
- `#about`

## Requirements

- Node.js and npm
- A modern browser
- Mobile device permissions for step tracking features

## Installation

```bash
npm install
```

## Run Locally

Start the development server with BrowserSync:

```bash
npm start
```

Then open the local server shown in the terminal, usually `http://localhost:3000`.

## Build

Create an optimized production build in `dist`:

```bash
npm run build
```

The build process minifies the SPA entry, CSS, JavaScript modules, service worker, and optimizes images.

## Step Tracking Note

The step counter uses device motion sensors. On iOS, the browser may ask for motion permission before tracking can start. If step tracking does not begin automatically, allow motion access and try again on a supported mobile device.

## Project Structure

- `index.html` - single routed app shell
- `app.js` - shared app state, templates, and section behavior
- `router.js` - hash router for navigation
- `theme.js` - saved theme bootstrap and toggle helper
- `style.css` - global styling
- `images/` - image assets
- `gulpfile.js` - build tasks
- `service-worker.js` - offline support

## License

ISC