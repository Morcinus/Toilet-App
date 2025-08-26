const axios = require("axios");

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const body = JSON.parse(event.body);
    const { toiletId, action } = body;

    // Read configuration from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!toiletId || !action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    if (!githubToken || !repoOwner || !repoName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "Server misconfiguration: missing GitHub environment variables",
        }),
      };
    }

    // Get the current file content from GitHub
    const filePath = `data/toilets/${toiletId}.md`;

    try {
      // Get current file content
      const getResponse = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
          params: { ref: branch },
        }
      );

      const currentContent = Buffer.from(
        getResponse.data.content,
        "base64"
      ).toString("utf-8");
      const currentSha = getResponse.data.sha;

      // Parse the frontmatter and update the specific field
      const updatedContent = updateToiletData(currentContent, action);

      // Commit the changes to GitHub
      const commitResponse = await axios.put(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
        {
          message: `Update toilet ${toiletId}: ${action}`,
          content: Buffer.from(updatedContent).toString("base64"),
          sha: currentSha,
          branch,
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
          message: `Toilet ${toiletId} updated successfully`,
          commit: commitResponse.data.commit,
        }),
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Toilet file not found" }),
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error updating toilet:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};

function updateToiletData(content, action) {
  // Split content into frontmatter and body
  const parts = content.split("---");
  if (parts.length < 3) {
    throw new Error("Invalid markdown format");
  }

  const frontmatter = parts[1];
  const body = parts.slice(2).join("---");

  // Parse frontmatter
  const lines = frontmatter.trim().split("\n");
  const updatedLines = [];
  let foundField = false;

  for (const line of lines) {
    if (
      line.startsWith("likes:") ||
      line.startsWith("dislikes:") ||
      line.startsWith("totalRatings:") ||
      line.startsWith("rating:") ||
      line.startsWith("updatedAt:")
    ) {
      if (action === "like" && line.startsWith("likes:")) {
        const currentLikes = parseInt(line.split(":")[1].trim());
        updatedLines.push(`likes: ${currentLikes + 1}`);
        foundField = true;
      } else if (action === "dislike" && line.startsWith("dislikes:")) {
        const currentDislikes = parseInt(line.split(":")[1].trim());
        updatedLines.push(`dislikes: ${currentDislikes + 1}`);
        foundField = true;
      } else if (action === "like" || action === "dislike") {
        if (line.startsWith("totalRatings:")) {
          const currentTotal = parseInt(line.split(":")[1].trim());
          updatedLines.push(`totalRatings: ${currentTotal + 1}`);
        } else if (line.startsWith("rating:")) {
          // We'll recalculate this based on likes/dislikes
          updatedLines.push(line);
        } else if (line.startsWith("updatedAt:")) {
          updatedLines.push(`updatedAt: "${new Date().toISOString()}"`);
        } else {
          updatedLines.push(line);
        }
      } else {
        updatedLines.push(line);
      }
    } else {
      updatedLines.push(line);
    }
  }

  // Recalculate rating if we updated likes/dislikes
  if (foundField && (action === "like" || action === "dislike")) {
    let likes = 0;
    let dislikes = 0;

    for (const line of updatedLines) {
      if (line.startsWith("likes:")) {
        likes = parseInt(line.split(":")[1].trim());
      } else if (line.startsWith("dislikes:")) {
        dislikes = parseInt(line.split(":")[1].trim());
      }
    }

    const totalRatings = likes + dislikes;
    const rating =
      totalRatings > 0 ? (likes * 5 + dislikes * 1) / totalRatings : 0;

    // Update the rating line
    for (let i = 0; i < updatedLines.length; i++) {
      if (updatedLines[i].startsWith("rating:")) {
        updatedLines[i] = `rating: ${rating.toFixed(1)}`;
        break;
      }
    }
  }

  // Reconstruct the content
  return `---\n${updatedLines.join("\n")}\n---\n${body}`;
}
