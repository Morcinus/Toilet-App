## 1. View All Toilets on Map

**Scenario:**

- The user opens the app.
- All toilets are displayed as pins on the map of Prague by default.
- Each pin represents a single toilet location.

**Implementation Details:**

- Use Google Maps if possible; fallback to OpenStreetMap/Leaflet if Google Maps authentication is too complex.
- All pins should be individually displayed.
- Clicking a pin opens the toilet card above the map.
