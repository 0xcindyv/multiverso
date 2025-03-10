# Bitmap Multiverso Bitcoin Community

An interactive 3D visualization tool for metaverse spaces based on bitmap data.

## Overview

203779.bitmap Multiverso Community transforms sequences of numbers into interactive 3D representations, where each number represents the size of a block in the metaverse space. This project uses advanced layout algorithms to organize blocks efficiently, creating a visually appealing and navigable representation of your metaverse space.

## Live Demo

Experience the 203779.bitmap Multiverso Community:

- [multiverso.club](https://multiverso.club) - Main site

## Key Features

- **Interactive 3D Visualization**: Explore the multiverso space in 3D with intuitive camera controls
- **Spaceship Navigation**: Control a virtual spaceship to fly through the multiverso
- **Collision Detection**: Experience realistic interactions with blocks in the environment
- **Data Analysis**: View detailed statistics about your space, including size distribution
- **Responsive Interface**: Works on desktop for now

## Technologies

- **React**: UI library for building the application interface
- **TypeScript**: Type-safe JavaScript for robust code
- **Three.js**: 3D rendering library for the browser
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful components for React Three Fiber
- **GSAP**: Animation library for smooth transitions
- **Vite**: Fast build tool for web development

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/0xcindyv/multiverso.git
   cd multiverso
   ```

2. Navigate to the project directory:
   ```bash
   cd multiverso-project
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

## Usage Guide

### Advanced Features

#### Movement Controls
- **W or ↑**: Move forward
- **S or ↓**: Move backward
- **A or ←**: Move left
- **D or →**: Move right
- **E or Space**: Move up
- **Control**: Move down
- **Shift**: Increase speed
- **Mouse**: Look around and change direction
- **Search**: Enter the parcel number (0-281)

## MondrianLayout Algorithm

The MondrianLayout algorithm is used to efficiently organize blocks in space, inspired by the artistic style of Piet Mondrian. The algorithm works as follows:

1. Calculates the total space needed based on block sizes
2. Places each block in the available space, starting with the largest
3. Fills empty spaces with smaller blocks
4. Creates a visually balanced layout that maximizes space utilization

## Browser Compatibility

The Bitmap Metaverse Viewer works best in modern browsers that support WebGL:

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the [BitFeed Project](https://github.com/bitfeed-project/bitfeed) by @mononaut
- Special thanks to [bitmap-utils](https://github.com/bitlodo/bitmap-utils) by @bitlodo for providing essential utilities for bitmap visualization and layout algorithms
- Three.js community for their excellent documentation and examples
- React Three Fiber team for making Three.js integration with React seamless
