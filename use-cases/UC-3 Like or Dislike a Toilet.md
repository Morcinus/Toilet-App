## 3. Like / Dislike a Toilet

**Scenario:**

- The user clicks the like or dislike button on a toilet card.
- The star rating updates immediately based on the new average.
- The user can like or dislike the same toilet multiple times.

**Implementation Details:**

- Store likes/dislikes in the markdown frontmatter for simplicity (or dynamically calculate when reading data).
- Update the star rating on the frontend in real time.
- No authentication or user restrictions needed.
