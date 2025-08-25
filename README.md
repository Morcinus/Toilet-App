# Prague Toilet Map App

A modern, interactive web application for finding and reviewing toilet facilities in Prague, Czech Republic. Built with React, TypeScript, and modern web technologies.

## Features

- 🗺️ **Interactive Map**: View all toilets on an interactive map centered on Prague
- 📍 **Location Pins**: Each toilet is displayed as a colored pin with custom icons
- 💳 **Detailed Information**: Click pins to view comprehensive toilet details
- ⭐ **Ratings & Reviews**: See user ratings and total review counts
- ♿ **Accessibility Info**: Filter by accessibility features and baby changing facilities
- 💰 **Cost Information**: Clear indication of free vs. paid facilities
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: OpenStreetMap with React Leaflet
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Toilet-App
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── ToiletMap.tsx   # Main map component
│   ├── ToiletCard.tsx  # Toilet information card
│   └── Header.tsx      # Application header
├── types/               # TypeScript type definitions
├── data/                # Sample data and mock content
├── lib/                 # Utility functions
└── App.tsx             # Main application component
```

## Use Cases Implemented

### UC-1: View Toilet Map ✅

- All toilets displayed as pins on Prague map
- Interactive markers with custom icons
- Click pins to view toilet details
- Color-coded legend for different facility types

## Future Use Cases

- **UC-2**: View Toilet Details (partially implemented)
- **UC-3**: Like/Dislike Toilets (UI ready, backend pending)
- **UC-4**: Add New Toilet (button ready, form pending)
- **UC-5**: Data Storage (local storage implementation pending)
- **UC-6**: Toilet Images (structure ready)
- **UC-7**: Responsive UI (implemented)

## Map Features

- **Custom Markers**: Different colors for free (green), accessible (blue), and paid (orange) facilities
- **Interactive Popups**: Quick info on hover/click
- **Detailed Cards**: Full information display when markers are clicked
- **Legend**: Clear visual guide for marker meanings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- OpenStreetMap for map data
- Leaflet for map functionality
- shadcn/ui for beautiful components
- Prague community for inspiration
