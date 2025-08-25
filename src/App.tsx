import { useState } from "react";
import { ToiletMap } from "./components/ToiletMap";
import { Header } from "./components/Header";
import { sampleToilets } from "../data/sampleToilets";
import "./index.css";

function App() {
  const [toilets] = useState(sampleToilets);

  const handleToiletSelect = (toilet: any) => {
    console.log("Selected toilet:", toilet);
  };

  const handleAddToilet = () => {
    // TODO: Implement add toilet functionality (UC-4)
    console.log("Add toilet clicked");
  };

  return (
    <div className="h-screen flex flex-col">
      <Header onAddToilet={handleAddToilet} />
      <div className="flex-1 relative">
        <ToiletMap toilets={toilets} onToiletSelect={handleToiletSelect} />
      </div>
    </div>
  );
}

export default App;
