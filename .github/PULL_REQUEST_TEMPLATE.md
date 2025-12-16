## Summary

This PR implements UI improvements: a branded header, Google Font, a search box with a state filter, a live results badge, marker clustering, and a locate button with geolocation fallback.

### Changes
- Header + Google Font + logo
- Search box and state filter (debounced)
- Results badge with live count
- Marker clustering (Leaflet.markercluster)
- Locate button with plugin & fallback geolocation
- Styling and color palette polish

### How to test locally
1. Install Node.js and run: `npx http-server public -p 8080`
2. Visit http://localhost:8080 and try searching, filtering by state, and using the locate button.

---

If you'd like, I can add screenshots to this PR or enable GitHub Pages to preview the site.
