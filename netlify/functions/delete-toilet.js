const axios = require("axios");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { toiletId } = body;

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!toiletId || !githubToken || !repoOwner || !repoName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required parameters or environment variables",
        }),
      };
    }

    // Get current file SHA to delete
    const getResp = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets/${toiletId}.md`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const sha = getResp.data.sha;

    await axios.delete(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/toilets/${toiletId}.md`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        data: { message: `Delete toilet ${toiletId}`, sha, branch },
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Toilet deleted" }),
    };
  } catch (error) {
    console.error(
      "Delete toilet error:",
      error?.response?.data || error.message
    );
    const msg = error?.response?.data?.message || error.message;
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: msg }),
    };
  }
};
