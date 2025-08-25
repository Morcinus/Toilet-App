export interface GitHubConfig {
  token: string;
  repoOwner: string;
  repoName: string;
  branch?: string;
}

export interface UpdateResponse {
  success: boolean;
  message: string;
  commit?: any;
  error?: string;
}

class GitHubService {
  private config: GitHubConfig | null = null;

  setConfig(config: GitHubConfig) {
    this.config = config;
  }

  getConfig(): GitHubConfig | null {
    return this.config;
  }

  async updateToilet(
    toiletId: string,
    action: "like" | "dislike"
  ): Promise<UpdateResponse> {
    if (!this.config) {
      throw new Error("GitHub configuration not set");
    }

    try {
      const response = await fetch("/.netlify/functions/update-toilet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toiletId,
          action,
          githubToken: this.config.token,
          repoOwner: this.config.repoOwner,
          repoName: this.config.repoName,
          branch: this.config.branch || "main",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update toilet");
      }

      return data;
    } catch (error) {
      console.error("Error updating toilet:", error);
      return {
        success: false,
        message: "Error occurred",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Helper method to validate GitHub token
  async validateToken(
    token: string,
    repoOwner: string,
    repoName: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Error validating GitHub token:", error);
      return false;
    }
  }
}

export const githubService = new GitHubService();
