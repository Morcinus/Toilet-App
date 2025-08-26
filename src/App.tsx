import { useState, useEffect } from "react";
import { ToiletMap } from "./components/ToiletMap";
import { Header } from "./components/Header";
import { GitHubConfig } from "./components/GitHubConfig";
import { StatusIndicator } from "./components/StatusIndicator";
import { Toilet } from "./types/toilet";
import { githubService } from "./services/githubService";
import "./index.css";

function App() {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [showGitHubConfig, setShowGitHubConfig] = useState(false);
  const [isGitHubConfigured, setIsGitHubConfigured] = useState(false);

  useEffect(() => {
    // Check if GitHub is configured
    const config = githubService.getConfig();
    setIsGitHubConfigured(!!config);
  }, []);

  useEffect(() => {
    // Load toilets from markdown files in data/toilets
    const loadToiletsFromMarkdown = async () => {
      try {
        const modules = import.meta.glob("../data/toilets/*.md", {
          as: "raw",
          eager: true,
        }) as Record<string, string>;

        const parsedToilets: Toilet[] = Object.values(modules)
          .map((content) => parseToiletFromMarkdown(content))
          .filter((t): t is Toilet => t !== null);

        setToilets(parsedToilets);
      } catch (error) {
        console.error("Failed to load toilets from markdown:", error);
      }
    };

    loadToiletsFromMarkdown();
  }, []);

  const handleToiletSelect = (toilet: Toilet) => {
    console.log("Selected toilet:", toilet);
  };

  const handleAddToilet = () => {
    // TODO: Implement add toilet functionality (UC-4)
    console.log("Add toilet clicked");
  };

  const handleShowGitHubConfig = () => {
    setShowGitHubConfig(true);
  };

  const handleGitHubConfigSaved = () => {
    setShowGitHubConfig(false);
    setIsGitHubConfigured(true);
  };

  // UC-3 Like/Dislike handlers with GitHub persistence
  const handleLike = async (toiletId: string) => {
    // Update local state immediately for responsive UI
    setToilets((prevToilets) =>
      prevToilets.map((toilet) => {
        if (toilet.id === toiletId) {
          const newLikes = toilet.likes + 1;
          const newTotalRatings = toilet.totalRatings + 1;
          const newRating =
            (newLikes * 5 + toilet.dislikes * 1) / newTotalRatings;

          return {
            ...toilet,
            likes: newLikes,
            totalRatings: newTotalRatings,
            rating: newRating,
            updatedAt: new Date().toISOString(),
          };
        }
        return toilet;
      })
    );

    // If GitHub is configured, persist the change
    if (isGitHubConfigured) {
      try {
        const result = await githubService.updateToilet(toiletId, "like");
        if (!result.success) {
          console.error("Failed to persist like:", result.error);
          // Optionally revert the local state change
        } else {
          console.log("Like persisted successfully:", result.message);
        }
      } catch (error) {
        console.error("Error persisting like:", error);
      }
    }
  };

  const handleDislike = async (toiletId: string) => {
    // Update local state immediately for responsive UI
    setToilets((prevToilets) =>
      prevToilets.map((toilet) => {
        if (toilet.id === toiletId) {
          const newDislikes = toilet.dislikes + 1;
          const newTotalRatings = toilet.totalRatings + 1;
          const newRating =
            (toilet.likes * 5 + newDislikes * 1) / newTotalRatings;

          return {
            ...toilet,
            dislikes: newDislikes,
            totalRatings: newTotalRatings,
            rating: newRating,
            updatedAt: new Date().toISOString(),
          };
        }
        return toilet;
      })
    );

    // If GitHub is configured, persist the change
    if (isGitHubConfigured) {
      try {
        const result = await githubService.updateToilet(toiletId, "dislike");
        if (!result.success) {
          console.error("Failed to persist dislike:", result.error);
          // Optionally revert the local state change
        } else {
          console.log("Dislike persisted successfully:", result.message);
        }
      } catch (error) {
        console.error("Error persisting dislike:", error);
      }
    }
  };

  if (showGitHubConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GitHubConfig onConfigSaved={handleGitHubConfigSaved} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header onAddToilet={handleAddToilet} />

      {/* GitHub Configuration Button */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusIndicator
              status={isGitHubConfigured ? "configured" : "not-configured"}
              lastUpdate={
                isGitHubConfigured ? new Date().toISOString() : undefined
              }
            />
            <span className="text-sm text-blue-800">
              {isGitHubConfigured
                ? "Changes will be committed to repository"
                : "Configure GitHub to persist your changes"}
            </span>
          </div>
          <button
            onClick={handleShowGitHubConfig}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {isGitHubConfigured ? "Reconfigure" : "Configure GitHub"}
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ToiletMap
          toilets={toilets}
          onToiletSelect={handleToiletSelect}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      </div>
    </div>
  );
}

export default App;

function parseToiletFromMarkdown(content: string): Toilet | null {
  // Expect frontmatter between leading --- lines
  const parts = content.split("---");
  if (parts.length < 3) {
    return null;
  }

  const frontmatter = parts[1].trim();
  const lines = frontmatter.split("\n");
  const data: Record<string, unknown> = {};

  for (const line of lines) {
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
      data[key] = value;
      continue;
    }

    // Arrays: very simple parser for []
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = [];
      }
      continue;
    }

    // booleans
    if (value === "true" || value === "false") {
      data[key] = value === "true";
      continue;
    }

    // numbers
    if (!Number.isNaN(Number(value))) {
      data[key] = Number(value);
      continue;
    }

    // fallback as string
    data[key] = value;
  }

  // Validate required fields
  const requiredKeys = [
    "id",
    "name",
    "address",
    "latitude",
    "longitude",
    "isFree",
    "rating",
    "totalRatings",
    "likes",
    "dislikes",
    "images",
    "createdAt",
    "updatedAt",
  ];

  for (const key of requiredKeys) {
    if (!(key in data)) {
      return null;
    }
  }

  return {
    id: String(data.id),
    name: String(data.name),
    address: String(data.address),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    description:
      typeof data.description === "string" ? data.description : undefined,
    isFree: Boolean(data.isFree),
    rating: Number(data.rating),
    totalRatings: Number(data.totalRatings),
    likes: Number(data.likes),
    dislikes: Number(data.dislikes),
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    createdAt: String(data.createdAt),
    updatedAt: String(data.updatedAt),
  };
}
