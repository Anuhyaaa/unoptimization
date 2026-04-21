# FitTrack

FitTrack is a lightweight fitness web app for tracking daily movement and habits.

## Features

- Real-time step tracking on supported mobile browsers
- Water intake tracking with daily goals
- Weekly and progress summaries
- Distance and calorie estimates
- Daily motivation quotes
- Nutrition and profile pages
- Theme and app settings
- Simple static pages with shared styling

## Navigation

The site includes these pages:

- `Home`
- `Steps`
- `Weekly`
- `Water`
- `Quotes`
- `Nutrition`
- `Profile`
- `Progress`
- `Distance`
- `Settings`
- `About`

## Requirements

- A modern browser
- Mobile device permissions for step tracking features

Open `index.html` directly in a browser to run the site.

## Step Tracking Note

The step counter uses device motion sensors. On iOS, the browser may ask for motion permission before tracking can start. If step tracking does not begin automatically, allow motion access and try again on a supported mobile device.

## Project Structure

- `index.html` - home page
- `steps.html` - step counter page
- `weekly.html` - weekly summary
- `water.html` - water tracker
- `quotes.html` - daily quotes
- `nutrition.html` - nutrition guide
- `profile.html` - profile page
- `progress.html` - progress page
- `distance.html` - distance page
- `settings.html` - settings page
- `about.html` - about page
- `app.js` - shared app behavior
- `router.js` - page navigation helper
- `theme.js` - theme bootstrap and toggle helper
- `style.css` - global styling
- `images/` - image assets

## License

ISC