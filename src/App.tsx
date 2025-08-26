import { useState, useEffect } from "react";
import { ToiletMap } from "./components/ToiletMap";
import { Header } from "./components/Header";
import { AddToiletMode } from "./components/AddToiletMode";
import { AddToiletForm } from "./components/AddToiletForm";
import { EditToiletForm } from "./components/EditToiletForm";
import { Toilet, ToiletFormData } from "./types/toilet";
import { githubService } from "./services/githubService";
import "./index.css";

function App() {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  // GitHub config UI no longer needed when server has env vars
  const [isGitHubConfigured, setIsGitHubConfigured] = useState(true);
  const [isAddingToilet, setIsAddingToilet] = useState(false);
  const [showAddToiletForm, setShowAddToiletForm] = useState(false);
  const [placementCoordinates, setPlacementCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [editingToilet, setEditingToilet] = useState<Toilet | null>(null);
  // Track user votes for each toilet: 'like', 'dislike', or undefined
  const [userVotes, setUserVotes] = useState<
    Record<string, "like" | "dislike">
  >({});

  useEffect(() => {
    // Always consider backend configured when env vars are set (no client config)
    setIsGitHubConfigured(true);
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

        console.log("Loaded toilets from markdown:", parsedToilets);
        setToilets(parsedToilets);
      } catch (error) {
        console.error("Failed to load toilets from markdown:", error);
      }
    };

    // Only load toilets if we don't have any yet
    if (toilets.length === 0) {
      loadToiletsFromMarkdown();
    }
  }, [toilets.length]);

  const handleToiletSelect = (toilet: Toilet) => {
    console.log("Selected toilet:", toilet);
  };

  const handleAddToilet = () => {
    setIsAddingToilet(true);
  };

  const handleCancelAddToilet = () => {
    setIsAddingToilet(false);
    setShowAddToiletForm(false);
    setPlacementCoordinates(null);
  };

  const handleEditToilet = (toilet: Toilet) => {
    setEditingToilet(toilet);
  };

  const handleCancelEditToilet = () => {
    setEditingToilet(null);
  };

  const handleToiletPlaced = (coordinates: { lat: number; lng: number }) => {
    setPlacementCoordinates(coordinates);
    setShowAddToiletForm(true);
    setIsAddingToilet(false);
  };

  const handleToiletFormSubmit = async (formData: ToiletFormData) => {
    try {
      // Get image data if available
      const imageData = formData.imageData || undefined;

      // Add toilet via GitHub service
      const result = await githubService.addToilet({
        name: formData.name,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description,
        isFree: formData.isFree,
        imageData,
      });

      if (result.success && result.toilet) {
        // Create the new toilet object with the returned data
        const newToilet: Toilet = {
          id: result.toilet.id,
          name: result.toilet.name,
          address: result.toilet.address,
          latitude: result.toilet.latitude,
          longitude: result.toilet.longitude,
          description: result.toilet.description,
          isFree: result.toilet.isFree,
          rating: 0,
          totalRatings: 0,
          likes: 0,
          dislikes: 0,
          images: result.toilet.imageUrl ? [result.toilet.imageUrl] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to local state
        setToilets((prev) => [...prev, newToilet]);

        // Reset form state
        setShowAddToiletForm(false);
        setPlacementCoordinates(null);

        console.log("New toilet added successfully:", newToilet);
      } else {
        console.error("Failed to add toilet:", result.error);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error("Error adding toilet:", error);
      // TODO: Show error message to user
    }
  };

  const handleEditToiletFormSubmit = async (formData: ToiletFormData) => {
    if (!editingToilet) return;

    try {
      const imageData = formData.imageData || undefined;

      // Calculate which images were removed (this is a simplified approach)
      // In a real app, you'd track which specific images were removed
      const removedImages: number[] = [];

      const result = await githubService.updateToiletDetails({
        toiletId: editingToilet.id,
        name: formData.name,
        address: formData.address,
        description: formData.description,
        isFree: formData.isFree,
        imageData,
        removedImages,
      });

      if (result.success && result.toilet) {
        // Update the toilet in local state
        setToilets((prev) =>
          prev.map((toilet) =>
            toilet.id === editingToilet.id
              ? {
                  ...toilet,
                  name: result.toilet!.name,
                  address: result.toilet!.address,
                  description: result.toilet!.description,
                  isFree: result.toilet!.isFree,
                  images: result.toilet!.images,
                  updatedAt: new Date().toISOString(),
                }
              : toilet
          )
        );

        // Close edit form
        setEditingToilet(null);
        console.log("Toilet updated successfully:", result.toilet);
      } else {
        console.error("Failed to update toilet:", result.error);
      }
    } catch (error) {
      console.error("Error updating toilet:", error);
    }
  };

  const handleDeleteToilet = async (toiletId: string) => {
    try {
      const res = await githubService.deleteToilet(toiletId);
      if (res.success) {
        setToilets((prev) => prev.filter((t) => t.id !== toiletId));
        setEditingToilet(null);
      } else {
        console.error("Failed to delete toilet:", res.error);
      }
    } catch (e) {
      console.error("Delete toilet error:", e);
    }
  };

  // GitHub config UI disabled when using server env vars

  // UC-3 Like/Dislike handlers with GitHub persistence
  const handleLike = async (toiletId: string) => {
    // Check if user already voted
    const currentVote = userVotes[toiletId];
    if (currentVote === "like") {
      return; // Already liked, do nothing
    }

    // Update user votes
    setUserVotes((prev) => ({ ...prev, [toiletId]: "like" }));

    // Update local state immediately for responsive UI
    setToilets((prevToilets) => {
      const updatedToilets = prevToilets.map((toilet) => {
        if (toilet.id === toiletId) {
          let newLikes = toilet.likes;
          let newDislikes = toilet.dislikes;
          let newTotalRatings = toilet.totalRatings;

          if (currentVote === "dislike") {
            // User is changing from dislike to like
            newDislikes = Math.max(0, toilet.dislikes - 1);
            newLikes = toilet.likes + 1;
            newTotalRatings = toilet.totalRatings; // Total stays the same
          } else {
            // User is voting for the first time
            newLikes = toilet.likes + 1;
            newTotalRatings = toilet.totalRatings + 1;
          }

          const newRating =
            (newLikes * 5 + newDislikes * 1) / (newLikes + newDislikes);

          const updatedToilet = {
            ...toilet,
            likes: newLikes,
            dislikes: newDislikes,
            totalRatings: newTotalRatings,
            rating: newRating,
            updatedAt: new Date().toISOString(),
          };
          return updatedToilet;
        }
        return toilet;
      });
      return updatedToilets;
    });

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
    // Check if user already voted
    const currentVote = userVotes[toiletId];
    if (currentVote === "dislike") {
      return; // Already disliked, do nothing
    }

    // Update user votes
    setUserVotes((prev) => ({ ...prev, [toiletId]: "dislike" }));

    // Update local state immediately for responsive UI
    setToilets((prevToilets) => {
      const updatedToilets = prevToilets.map((toilet) => {
        if (toilet.id === toiletId) {
          let newLikes = toilet.likes;
          let newDislikes = toilet.dislikes;
          let newTotalRatings = toilet.totalRatings;

          if (currentVote === "like") {
            // User is changing from like to dislike
            newLikes = Math.max(0, toilet.likes - 1);
            newDislikes = toilet.dislikes + 1;
            newTotalRatings = toilet.totalRatings; // Total stays the same
          } else {
            // User is voting for the first time
            newDislikes = toilet.dislikes + 1;
            newTotalRatings = toilet.totalRatings + 1;
          }

          const newRating =
            (newLikes * 5 + newDislikes * 1) / (newLikes + newDislikes);

          const updatedToilet = {
            ...toilet,
            likes: newLikes,
            dislikes: newDislikes,
            totalRatings: newTotalRatings,
            rating: newRating,
            updatedAt: new Date().toISOString(),
          };
          return updatedToilet;
        }
        return toilet;
      });
      return updatedToilets;
    });

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

  // Config screen disabled when using server env vars

  // Show add toilet mode
  if (isAddingToilet) {
    return (
      <div className="h-screen flex flex-col">
        <Header onAddToilet={handleAddToilet} />
        <AddToiletMode
          onCancel={handleCancelAddToilet}
          onToiletPlaced={handleToiletPlaced}
        />
      </div>
    );
  }

  // Show add toilet form
  if (showAddToiletForm && placementCoordinates) {
    return (
      <div className="h-screen flex flex-col">
        <Header onAddToilet={handleAddToilet} />
        <div className="flex-1 relative">
          <ToiletMap
            toilets={toilets}
            userVotes={userVotes}
            onToiletSelect={handleToiletSelect}
            onLike={handleLike}
            onDislike={handleDislike}
            onEdit={handleEditToilet}
          />
        </div>
        <AddToiletForm
          coordinates={placementCoordinates}
          onCancel={handleCancelAddToilet}
          onSubmit={handleToiletFormSubmit}
        />
      </div>
    );
  }

  // Show edit toilet form
  if (editingToilet) {
    return (
      <div className="h-screen flex flex-col">
        <Header onAddToilet={handleAddToilet} />
        <div className="flex-1 relative">
          <ToiletMap
            toilets={toilets}
            userVotes={userVotes}
            onToiletSelect={handleToiletSelect}
            onLike={handleLike}
            onDislike={handleDislike}
            onEdit={handleEditToilet}
          />
        </div>
        <EditToiletForm
          toilet={editingToilet}
          onCancel={handleCancelEditToilet}
          onSubmit={handleEditToiletFormSubmit}
          onDelete={handleDeleteToilet}
        />
      </div>
    );
  }

  // Show main map
  return (
    <div className="h-screen flex flex-col">
      <Header onAddToilet={handleAddToilet} />

      <div className="flex-1 relative">
        <ToiletMap
          toilets={toilets}
          userVotes={userVotes}
          onToiletSelect={handleToiletSelect}
          onLike={handleLike}
          onDislike={handleDislike}
          onEdit={handleEditToilet}
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
