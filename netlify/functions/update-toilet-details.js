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
      toiletId,
      name,
      address,
      description,
      isFree,
      imageData,
      removedImages,
    } = body;

    // Get GitHub credentials from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (
      !toiletId ||
      !name ||
      !address ||
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

    // Get the existing toilet file to read current data
    const getFileResponse = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets/${toiletId}.md`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const existingContent = Buffer.from(
      getFileResponse.data.content,
      "base64"
    ).toString();
    const existingSha = getFileResponse.data.sha;

    // Parse existing frontmatter to get current values
    const parts = existingContent.split("---");
    if (parts.length < 3) {
      throw new Error("Invalid markdown format");
    }

    const frontmatterLines = parts[1].trim().split("\n");
    const existingData = {};

    for (const line of frontmatterLines) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();

      // Strip surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      existingData[key] = value;
    }

    // Get current coordinates and other fields
    const latitude = parseFloat(existingData.latitude);
    const longitude = parseFloat(existingData.longitude);
    const rating = parseFloat(existingData.rating) || 0;
    const totalRatings = parseInt(existingData.totalRatings) || 0;
    const likes = parseInt(existingData.likes) || 0;
    const dislikes = parseInt(existingData.dislikes) || 0;
    const createdAt = existingData.createdAt;
    const currentImages = JSON.parse(existingData.images || "[]");

    // Process image changes
    let updatedImages = [...currentImages];

    // Remove specified images
    if (removedImages && Array.isArray(removedImages)) {
      updatedImages = updatedImages.filter(
        (_, index) => !removedImages.includes(index)
      );
    }

    // Add new image if provided
    let newImageUrl = "";
    if (imageData) {
      try {
        // Extract base64 data
        const base64Data = imageData.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Generate a unique filename
        const timestamp = Date.now();
        const imageFilename = `toilet-${toiletId}-edit-${timestamp}.jpg`;

        const imageContent = imageBuffer.toString("base64");

        const imageResponse = await axios.put(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/images/${imageFilename}`,
          {
            message: `Update image for toilet: ${name}`,
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

        // Get the download URL for the new image
        newImageUrl = imageResponse.data.content.download_url;
        updatedImages.push(newImageUrl);
      } catch (imageError) {
        console.error("Failed to upload new image:", imageError);
        // Continue without new image if upload fails
      }
    }

    // Create the updated markdown content with frontmatter
    const updatedFrontmatter = `---
id: "${toiletId}"
name: "${name}"
address: "${address}"
latitude: ${latitude}
longitude: ${longitude}
description: "${description || ""}"
isFree: ${isFree}
rating: ${rating}
totalRatings: ${totalRatings}
likes: ${likes}
dislikes: ${dislikes}
images: ${JSON.stringify(updatedImages)}
createdAt: "${createdAt}"
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

    // Update the toilet markdown file
    const updatedContent = Buffer.from(updatedFrontmatter).toString("base64");

    const updateResponse = await axios.put(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets/${toiletId}.md`,
      {
        message: `Update toilet: ${name}`,
        content: updatedContent,
        branch: branch,
        sha: existingSha,
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Toilet updated successfully",
        toilet: {
          id: toiletId,
          name,
          address,
          latitude,
          longitude,
          description,
          isFree,
          images: updatedImages,
          newImageUrl,
        },
      }),
    };
  } catch (error) {
    console.error("Error updating toilet:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Failed to update toilet",
        details: error.message,
      }),
    };
  }
};
