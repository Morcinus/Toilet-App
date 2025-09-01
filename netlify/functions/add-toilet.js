const axios = require("axios");

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      name,
      address,
      latitude,
      longitude,
      description,
      isFree,
      imageData,
    } = body;

    // Get GitHub credentials from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (
      !name ||
      !address ||
      !latitude ||
      !longitude ||
      !githubToken ||
      !repoOwner ||
      !repoName
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required parameters or environment variables",
        }),
      };
    }

    // Generate a new ID by getting the current file count
    const listResponse = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const existingFiles = listResponse.data.filter((item) =>
      item.name.endsWith(".md")
    );
    const newId = String(existingFiles.length + 1);

    // Create the markdown content with frontmatter
    const frontmatter = `---
id: "${newId}"
name: "${name}"
address: "${address}"
latitude: ${latitude}
longitude: ${longitude}
description: "${description || ""}"
isFree: ${isFree}
rating: 0
totalRatings: 0
likes: 0
dislikes: 0
images: []
createdAt: "${new Date().toISOString()}"
updatedAt: "${new Date().toISOString()}"
---

# ${name}

**Address:** ${address}
**Coordinates:** ${latitude}, ${longitude}
**Cost:** ${isFree ? "Free" : "Paid"}
${description ? `**Description:** ${description}` : ""}

## Location
This toilet is located at coordinates ${latitude}, ${longitude}.
`;

    // Create the toilet markdown file
    const toiletContent = Buffer.from(frontmatter).toString("base64");

    const createToiletResponse = await axios.put(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets/${newId}.md`,
      {
        message: `Add new toilet: ${name}`,
        content: toiletContent,
        branch: branch,
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    // If there's an image, upload it to the images directory
    let imageUrl = "";
    if (imageData) {
      try {
        // Extract base64 data and filename
        const base64Data = imageData.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Generate a unique filename
        const timestamp = Date.now();
        const imageFilename = `toilet-${newId}-${timestamp}.jpg`;

        const imageContent = imageBuffer.toString("base64");

        const imageResponse = await axios.put(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/images/${imageFilename}`,
          {
            message: `Add image for toilet: ${name}`,
            content: imageContent,
            branch: branch,
          },
          {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        // Construct clean GitHub raw URL (without authentication tokens)
        imageUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/data/images/${imageFilename}`;

        // Update the toilet file to include the image
        const updatedFrontmatter = frontmatter.replace(
          "images: []",
          `images: ["${imageUrl}"]`
        );

        const updatedContent =
          Buffer.from(updatedFrontmatter).toString("base64");

        await axios.put(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets/${newId}.md`,
          {
            message: `Update toilet ${name} with image`,
            content: updatedContent,
            branch: branch,
            sha: createToiletResponse.data.content.sha,
          },
          {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
      } catch (imageError) {
        console.error("Failed to upload image:", imageError);
        // Continue without image if upload fails
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Toilet added successfully",
        toilet: {
          id: newId,
          name,
          address,
          latitude,
          longitude,
          description,
          isFree,
          imageUrl,
        },
      }),
    };
  } catch (error) {
    console.error("Error adding toilet:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to add toilet",
        details: error.message,
      }),
    };
  }
};
