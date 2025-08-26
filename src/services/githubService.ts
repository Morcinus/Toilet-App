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

export interface AddToiletResponse {
  success: boolean;
  message: string;
  toilet?: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    description: string;
    isFree: boolean;
    imageUrl?: string;
  };
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
    try {
      const response = await fetch("/.netlify/functions/update-toilet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Backend reads repo/token/branch from environment; only send essentials
        body: JSON.stringify({ toiletId, action }),
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

  async addToilet(toiletData: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    description: string;
    isFree: boolean;
    imageData?: string;
  }): Promise<AddToiletResponse> {
    try {
      const response = await fetch("/.netlify/functions/add-toilet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toiletData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add toilet");
      }

      return data;
    } catch (error) {
      console.error("Error adding toilet:", error);
      return {
        success: false,
        message: "Error occurred",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Helper method to validate GitHub token
  // With server-side env usage, validation is not required on client anymore.
  async validateToken(): Promise<boolean> {
    return true;
  }
}

export const githubService = new GitHubService();
