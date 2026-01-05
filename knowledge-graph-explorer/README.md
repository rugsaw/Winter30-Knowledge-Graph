# Knowledge Graph Explorer

A React web application for exploring and generating knowledge graphs from text input. This application provides an intuitive interface for users to input text and visualize the relationships and entities as interactive knowledge graphs.

## About

Knowledge Graph Explorer is a frontend application built with React that allows users to:
- Input text through a user-friendly interface
- Upload a .txt file to process it for knowledge graph extraction
- Generate knowledge graphs from the provided text
- Explore relationships and entities in an interactive visualization
- Query the knowledge graph using natural language
- View factual triples and JSON representations of the graph

This project is part of the Winter30 Knowledge Graphs project and integrates with a backend knowledge graph server to process and visualize data.

## Technology Stack

- **React**: ^19.2.3 - UI library
- **React DOM**: ^19.2.3 - DOM rendering
- **React Router DOM**: ^7.11.0 - Client-side routing
- **React Bootstrap**: ^2.10.10 - Bootstrap components for React
- **Bootstrap**: ^5.3.8 - CSS framework
- **SASS**: ^1.97.1 - CSS preprocessor
- **vis-network**: ^10.0.2 - Network visualization library
- **React Scripts**: 5.0.1 - Build tooling and development server

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
├── public/                      # Static files and assets
│   ├── index.html              # HTML template
│   ├── favicon.ico             # Site favicon
│   ├── finscope.svg            # FinScope logo
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
├── src/
│   ├── components/             # Reusable React components
│   │   ├── AllowedTypes.js     # Component for displaying allowed entity/predicate/metric types
│   │   ├── GraphChatInterface.js  # Chat interface for querying knowledge graph
│   │   ├── ViewFactualTriplesModal.js  # Modal to view factual triples
│   │   └── ViewJSONModal.js    # Modal to view raw JSON representation
│   ├── constants/              # Application constants
│   │   └── url.constants.js    # API endpoint URLs and base path
│   ├── pages/                  # Page-level components
│   │   └── HomePage.js         # Main application page
│   ├── services/               # API and business logic services
│   │   ├── api.service.js      # Generic API request handler
│   │   └── kg.service.js       # Knowledge graph specific API calls
│   ├── utils/                  # Utility functions
│   │   └── pubsub.js           # Pub/Sub message bus for component communication
│   ├── styles/                 # Global styles (currently empty)
│   ├── App.js                  # Main app component with routing
│   ├── App.css                 # App-level styles
│   ├── index.js                # Application entry point
│   └── index.css               # Global CSS styles
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Configuration

### Backend Server

The application expects the knowledge graph server to be running on `http://localhost:5050`. You can modify the API base path in `src/constants/url.constants.js` if your server is running on a different address.

### Environment Variables

Currently, the application uses hardcoded API endpoints. For production deployments, consider using environment variables for configuration.

## Key Features

- **Interactive Graph Visualization**: Uses vis-network to render knowledge graphs with nodes and edges
- **Text Input & File Upload**: Supports both direct text input and .txt file uploads
- **Natural Language Querying**: Chat interface to ask questions about the generated knowledge graph
- **Multiple View Modes**: View the graph visually, as factual triples, or as raw JSON
- **Type Metadata Display**: Shows allowed entity types, predicates, and metric types
- **Event-Driven Architecture**: Uses pub/sub pattern for component communication

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

For more information about Create React App features and configuration, see the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

## Learn More

- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [React Bootstrap Documentation](https://react-bootstrap.github.io/)
- [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/)
