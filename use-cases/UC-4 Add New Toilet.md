## 4. Add a New Toilet

**Scenario:**

- The user clicks a “+ Add Toilet” button.
- A pin appears in the center of the map.
- The user moves the map to position the pin at the desired toilet location.
- The user clicks a green “Place Toilet” button.
- A form dialog opens allowing the user to enter:
  - Toilet name
  - Toilet description
  - Upload a single image
- The user submits the form.
- The new toilet pin appears on the map with its card available immediately.

**Implementation Details:**

- New toilets are stored as separate markdown files with YAML frontmatter.
- Frontmatter includes:
  - Name
  - Description
  - Image URL
  - Coordinates (latitude, longitude)
  - Likes / dislikes count
- Pins are immediately visible on map after submission.
- Ensure responsive design for form and card.
