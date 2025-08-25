import { useState } from "react";
import { ToiletMap } from "./components/ToiletMap";
import { Header } from "./components/Header";
import { sampleToilets } from "../data/sampleToilets";
import { Toilet } from "./types/toilet";
import "./index.css";

function App() {
  const [toilets, setToilets] = useState(sampleToilets);

  const handleToiletSelect = (toilet: Toilet) => {
    console.log("Selected toilet:", toilet);
  };

  const handleAddToilet = () => {
    // TODO: Implement add toilet functionality (UC-4)
    console.log("Add toilet clicked");
  };

  const handleLike = (toiletId: string) => {
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
  };

  const handleDislike = (toiletId: string) => {
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
  };

  return (
    <div className="h-screen flex flex-col">
      <Header onAddToilet={handleAddToilet} />
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
