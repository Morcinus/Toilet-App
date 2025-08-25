## 5. Data Storage

**Scenario:**

- Each toilet corresponds to a markdown file in the repository.
- Metadata is stored in YAML frontmatter.

**Implementation Details:**

- Example frontmatter:

```yaml
---
name: "Cool Toilet in Prague 1"
description: "Near the park, very clean."
image: "image-url.jpg"
coordinates: { lat: 50.088, lng: 14.420 }
likes: 5
dislikes: 1
---
```

- The app should read and display all markdown files as pins on the map.
- Adding a new toilet creates a new markdown file with appropriate frontmatter.
