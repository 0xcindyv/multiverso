# Bitmap Multiverso Bitcoin Community

An interactive 3D viewer for metaverse spaces based on bitmap data.

![Bitmap Metaverse Viewer](./public/screenshot.svg)

## About the Project

This project allows you to visualize metaverse spaces using bitmap data. It transforms a sequence of numbers into an interactive 3D representation, where each number represents the size of a block in space.

The viewer uses the MondrianLayout algorithm to efficiently organize blocks, creating a visual representation of your metaverse space.

## Features

- **Interactive 3D Visualization**: Explore your metaverse space in 3D with intuitive camera controls
- **Data Analysis**: View detailed statistics about your space, including size distribution
- **Sharing**: Share your space with others via URLs or social media
- **Image Export**: Capture and save images of your 3D visualization
- **Configuration Saving**: Save and load different bitmap configurations
- **File Import/Export**: Import and export your data in TXT and JSON formats
- **Responsive Interface**: Works on desktop and mobile devices
- **Spaceship Navigation**: Navigate through your 3D space with a controllable spaceship
- **Collision Detection**: Realistic collision detection between the spaceship and blocks
- **Multi-language Support**: Interface available in multiple languages

## Technologies Used

- **React 19**: Library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Three.js**: Library for 3D rendering in the browser
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful components for React Three Fiber
- **GSAP**: Animation library for smooth transitions
- **Vite**: Fast build tool for web development

## Project Structure

```
src/
├── assets/            # Static assets and resources
├── components/        # React components
│   ├── BitmapStats.tsx       # Component for displaying bitmap statistics
│   ├── FileOperations.tsx    # Component for file import/export operations
│   ├── MetaverseViewer.tsx   # Main 3D visualization component
│   ├── PlotCounter.jsx       # Component for counting and displaying plots
│   ├── SavedConfigs.tsx      # Component for managing saved configurations
│   └── ShareDialog.tsx       # Component for sharing visualizations
├── utils/             # Utility functions and helpers
│   ├── analysis/      # Analysis utilities
│   ├── layout/        # Layout algorithms
│   ├── storage/       # Storage utilities
│   ├── bitmapStats.ts        # Utility for calculating bitmap statistics
│   ├── checkPlotNumber.ts    # Utility for validating plot numbers
│   ├── common.ts             # Common utility functions
│   ├── constants.ts          # Application constants
│   ├── fileUtils.ts          # Utilities for file operations
│   ├── languageContext.tsx   # Context for language management
│   ├── MondrianLayout.ts     # Algorithm for block organization
│   ├── plotVerifier.ts       # Utility for verifying plots
│   ├── plotVerifierTest.ts   # Tests for plot verification
│   ├── storage.ts            # Utility for storing and retrieving configurations
│   └── urlParams.ts          # Utility for managing URL parameters
├── App.css            # Application styles
├── App.tsx            # Main application component
├── index.css          # Global styles
├── main.tsx           # Application entry point
└── vite-env.d.ts      # Vite environment type definitions
```

## How to Run

1. Clone the repository:
   ```
   git clone https://github.com/0xcindyv/multiverso.git
   cd multiverso
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the project in development mode:
   ```
   npm run dev
   ```

4. Access the viewer at `http://localhost:5173`

## How to Use

1. **Enter Data**: Enter bitmap values separated by commas in the text field
2. **View in 3D**: Click "View in 3D" to generate the visualization
3. **Explore**: Use the mouse to rotate the camera and the mouse wheel to zoom
4. **Navigate**: Use the spaceship to navigate through the 3D space (WASD keys)
5. **Interact**: Click on a block to highlight it and hover over a block to see information
6. **Export**: Click the "Export Image" button to save the current view
7. **Share**: Click the "Share" button to share your visualization
8. **Save**: Save your configurations for future use
9. **Import/Export**: Import and export your data in TXT and JSON formats

## Data Format

The viewer accepts a list of comma-separated numbers, where each number represents the size of a block in space. For example:

```
5,5,4,3,2,1
```

This will create 6 blocks with sizes 5, 5, 4, 3, 2, and 1, respectively.

### Supported File Formats

- **TXT**: Simple text file containing comma-separated values
- **JSON**: JSON file with the following structure:
  ```json
  {
    "bitmap": [5, 5, 4, 3, 2, 1],
    "createdAt": "2024-03-08T12:00:00.000Z",
    "format": "bitmap-metaverse-viewer"
  }
  ```

## MondrianLayout Algorithm

The MondrianLayout algorithm is used to efficiently organize blocks in space. It works as follows:

1. Calculates the total size of the required space
2. Places each block in the available space, starting with the largest
3. Fills empty spaces with smaller blocks
4. Creates a visually balanced layout

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
