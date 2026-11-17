# My Route — private delivery planner starter

This is the first working front-end starter for a personal delivery planner.

## Included now
- Add multiple addresses (one per line)
- Import a simple CSV file
- Export stops to CSV
- Mark stops completed
- Search stops
- Open the next or a selected stop in Google Maps
- Save and restore route lists on this browser/device
- Request the device's current location as the route start
- Installable PWA shell (requires HTTPS hosting)

## Important limitations
This starter does **not** yet optimize 200+ stops by road travel time, geocode addresses in bulk, read text from photos, or sync data between devices. The current location is recorded as a starting point, but is not yet used in an optimization calculation. Data is stored locally in the browser, so it does not automatically transfer between iPhone and Android.

Those capabilities require the next backend build:
1. Secure user login and a shared database.
2. Address validation/geocoding with a provider whose terms permit your usage.
3. A road travel-time matrix and server-side Google OR-Tools optimization.
4. Route chunking for Google Maps navigation, with next-stop progression.
5. Photo OCR and spreadsheet column mapping.

## Run locally
Serve this folder over localhost (not by opening index.html directly), for example:
`python -m http.server 8000`
Then visit `http://localhost:8000`.

For iPhone/Android installation, deploy the folder to an HTTPS static host. A production deployment should add authentication and backups before storing real customer addresses.
