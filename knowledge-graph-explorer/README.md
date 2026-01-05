# Knowledge Graph Explorer

A React web application for exploring and generating knowledge graphs from text input. This application provides an intuitive interface for users to input text and visualize the relationships and entities as interactive knowledge graphs.

## About

Knowledge Graph Explorer is a frontend application built with React that allows users to:
- Input text through a user-friendly interface
- Generate knowledge graphs from the provided text
- Explore relationships and entities in an interactive visualization

This project is part of the Winter30 Knowledge Graphs project and integrates with a backend knowledge graph server to process and visualize data.

## Technology Stack

- **React**: ^19.2.3
- **React DOM**: ^19.2.3
- **React Router DOM**: ^7.11.0 (for routing)
- **React Bootstrap**: ^2.10.10 (for UI components)
- **Bootstrap**: ^5.3.8 (for styling)
- **SASS**: ^1.97.1 (for advanced styling)
- **React Scripts**: 5.0.1 (build tooling)

## Prerequisites

Before running this application, make sure you have:
- Node.js (v14 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone the repository
2. Navigate to the `knowledge-graph-explorer` directory
3. Install dependencies:

```bash
npm install
```

## Available Scripts

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload automatically when you make changes.\
You may also see any lint errors in the console.

**Important**: Make sure the knowledge graph server is running if you need backend functionality.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project and copy all configuration files directly into your project.

## Project Structure

```
knowledge-graph-explorer/
├── public/              # Static files
├── src/
│   ├── pages/          # Page components (HomePage)
│   ├── services/       # API service utilities
│   ├── styles/         # Global styles
│   ├── App.js          # Main app component
│   └── index.js        # Entry point
├── package.json
└── README.md
```

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

For more information about Create React App features and configuration, see the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

## Learn More

- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [React Bootstrap Documentation](https://react-bootstrap.github.io/)
