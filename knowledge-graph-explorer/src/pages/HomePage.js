import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Alert, Spinner, Toast, ToastContainer, Modal } from 'react-bootstrap';
// vis-network and vis-data are loaded from CDN in index.html
// They are available as global variables: vis.Network and vis.DataSet
import './HomePage.scss';
import { messageBus } from '../utils/pubsub';
import { kgService } from '../services/kg.service';
import AllowedTypes from '../components/AllowedTypes';
import ViewJSONModal from '../components/ViewJSONModal';
import ViewFactualTriplesModal from '../components/ViewFactualTriplesModal';
import GraphChatInterface from '../components/GraphChatInterface';

function HomePage() {
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showJSONModal, setShowJSONModal] = useState(false);
  const [showFactualTriplesModal, setShowFactualTriplesModal] = useState(false);
  const [entityTypes, setEntityTypes] = useState([]);
  const [predicateTypes, setPredicateTypes] = useState([]);
  const [metricTypes, setMetricTypes] = useState([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [visualGraphNodes, setVisualGraphNodes] = useState(null);
  const [kgData, setKgData] = useState(null);
  const [factualTriples, setFactualTriples] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const graphWrapperRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setErrorMessage('Please upload a .txt file only.');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Read file contents
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      setUserInput(fileContent);
      // Clear error message
      if (errorMessage) {
        setErrorMessage('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setUserInput('');
    setErrorMessage('');
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewSchema = () => {
    setShowSchemaModal(true);
    setIsLoadingSchema(true);
    kgService.getAllowedTypes();
  };

  const handleToggleFullscreen = () => {
    if (!graphWrapperRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (graphWrapperRef.current.requestFullscreen) {
        graphWrapperRef.current.requestFullscreen();
      } else if (graphWrapperRef.current.webkitRequestFullscreen) {
        graphWrapperRef.current.webkitRequestFullscreen();
      } else if (graphWrapperRef.current.msRequestFullscreen) {
        graphWrapperRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleShowJSON = () => {
    setShowJSONModal(true);
  };

  const handleShowFactualTriples = () => {
    setShowFactualTriplesModal(true);
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Resize network when fullscreen changes
      if (networkRef.current) {
        setTimeout(() => {
          networkRef.current.setSize('100%', '100%');
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleGenerateGraph = () => {
    // Validate that text area is not empty
    if (!userInput || userInput.trim() === '') {
      setErrorMessage('The text area has to be filled.');
      return;
    }
    
    // Clear any previous error message and graph
    setErrorMessage('');
    setVisualGraphNodes(null);
    setKgData(null);
    setFactualTriples(null);
    setSelectedNode(null);
    setShowSidePanel(false);
    
    // Set loading state
    setIsLoading(true);
    
    // Show toast message
    setShowToast(true);
    
    kgService.generateKG(userInput);
  };

  const handleEvents = (event) => {
    switch (event['event_name']) {
      case 'KG_EXTRACTED_SUCCESS':
          console.log('KG extracted successfully:', event['data']?.kg);
          setIsLoading(false);
          setShowToast(false);
          // Store KG data for download
          if (event['data']?.kg) {
            setKgData(event['data'].kg);
          }
          // Store factual triples if available
          if (event['data']?.factual_triples) {
            setFactualTriples(event['data'].factual_triples);
          }
          // Store visual graph nodes if available
          if (event['data']?.visual_graph_nodes) {
            try {
              const graphData = typeof event['data'].visual_graph_nodes === 'string' 
                ? JSON.parse(event['data'].visual_graph_nodes)
                : event['data'].visual_graph_nodes;
              setVisualGraphNodes(graphData);
            } catch (error) {
              console.error('Error parsing visual_graph_nodes:', error);
            }
          }
          break;
      case 'KG_EXTRACTED_ERROR':
          console.error('KG extraction failed:', event['data']);
          setIsLoading(false);
          setShowToast(false);
          break;
      case 'ALLOWED_TYPES_FETCHED_SUCCESS':
          console.log('Allowed types fetched successfully:', event['data']);
          setEntityTypes(event['data'].entity_types || []);
          setPredicateTypes(event['data'].predicate_types || []);
          setMetricTypes(event['data'].metric_types || []);
          setIsLoadingSchema(false);
          break;
      case 'ALLOWED_TYPES_FETCHED_ERROR':
          console.error('Failed to fetch allowed types:', event['data']);
          setEntityTypes([]);
          setPredicateTypes([]);
          setMetricTypes([]);
          setIsLoadingSchema(false);
          break;
    }
  };

  useEffect(() => {
    const kgSubscriptionId = messageBus.subscribe('app__kg', handleEvents);
  
    return () => {
        messageBus.unsubscribe('app__kg', kgSubscriptionId);
    }
  }, []);

  // Initialize and update vis-network graph
  useEffect(() => {
    if (!visualGraphNodes || !containerRef.current) return;

    try {
      // Check if vis is available from CDN
      if (typeof window === 'undefined' || !window.vis) {
        console.error('vis-network and vis-data CDN scripts not loaded');
        return;
      }

      // Parse nodes and edges from visual_graph_nodes
      const nodes = new window.vis.DataSet(visualGraphNodes.nodes || []);
      const edges = new window.vis.DataSet(visualGraphNodes.edges || []);

      const data = { nodes, edges };
      
      const options = {
        physics: { enabled: false },
        nodes: {
          size: 30,
          font: { size: 18, face: 'Arial' },
          borderWidth: 3,
          shadow: true
        },
        edges: {
          width: 3,
          smooth: false,
          font: { size: 48, align: 'middle' },
          arrows: { to: { enabled: true, scaleFactor: 1.5 } }
        }
      };

      // Destroy existing network if it exists
      if (networkRef.current) {
        networkRef.current.destroy();
      }

      // Create new network
      const network = new window.vis.Network(containerRef.current, data, options);
      networkRef.current = network;

      // Handle node click events
      network.on('click', function (params) {
        if (params.nodes.length === 0) {
          setSelectedNode(null);
          return;
        }

        const nodeId = params.nodes[0];
        const node = nodes.get(nodeId);
        setSelectedNode(node);
      });

      // Handle window resize
      const handleResize = () => {
        if (networkRef.current && containerRef.current) {
          networkRef.current.setSize('100%', '100%');
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        if (networkRef.current) {
          networkRef.current.destroy();
          networkRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing graph:', error);
    }
  }, [visualGraphNodes]);

  return (
    <>
      <div className="finscope-title">
        <img src="/finscope.svg" alt="FinScope" className="finscope-logo" />
      </div>
      <Container className="home-page-container">
        <div className="home-page-content">
          <h1 className="mb-4">Knowledge Graph Explorer</h1>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              Enter financial text data to analyze and generate a knowledge graph:
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleViewSchema();
                }}
                className="view-schema-link"
              >
                View Schema
              </a>
            </Form.Label>
            <div className="d-flex align-items-center mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="txt-file-upload"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="me-2"
                disabled={isLoading}
              >
                Upload .txt File
              </Button>
              <small className="text-muted">(Optional - or type directly in the textarea below)</small>
            </div>
            <Form.Control
              as="textarea"
              rows={6}
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type your text here or upload a .txt file above..."
              className="knowledge-graph-textarea"
            />
            {errorMessage && (
              <Alert variant="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
          </Form.Group>
          <div className="button-container">
            <Button
              variant="secondary"
              onClick={handleClear}
              className="clear-button me-2"
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              variant="success"
              onClick={handleGenerateGraph}
              className="generate-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Generating...
                </>
              ) : (
                'Generate Knowledge Graph'
              )}
            </Button>
          </div>
        </Form>
        
        {/* Graph Visualization Section */}
        {visualGraphNodes && (
          <div className="graph-section mt-5">
            <div className="graph-header">
              <h2 className="mb-3">Your visualized graph is here</h2>
              <Button
                variant="outline-primary"
                className="fullscreen-btn"
                onClick={handleToggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <>
                    <span className="fullscreen-icon">⤓</span> Exit Fullscreen
                  </>
                ) : (
                  <>
                    <span className="fullscreen-icon">⤢</span> Fullscreen
                  </>
                )}
              </Button>
            </div>
            <div 
              className={`graph-container-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
              ref={graphWrapperRef}
            >
              <div 
                id="mynetwork" 
                ref={containerRef}
                className="graph-canvas"
              />
              {showSidePanel && (
                <div className="side-panel">
                  <div className="side-panel-header">
                    <h3>Node Details</h3>
                    <Button
                      variant="link"
                      className="close-panel-btn"
                      onClick={() => setShowSidePanel(false)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="node-details">
                    {selectedNode ? (
                      <>
                        <h4>{selectedNode.label}</h4>
                        {selectedNode.node_type && (
                          <p><b>Type:</b> {selectedNode.node_type}</p>
                        )}
                        {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 ? (
                          <table>
                            <tbody>
                              {Object.entries(selectedNode.properties).map(([key, value]) => (
                                <tr key={key}>
                                  <td className="key">{key}</td>
                                  <td>{String(value)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No properties available.</p>
                        )}
                      </>
                    ) : (
                      <p>Click a node to view details</p>
                    )}
                  </div>
                </div>
              )}
              {!showSidePanel && (
                <Button
                  variant="secondary"
                  className="toggle-panel-btn"
                  onClick={() => setShowSidePanel(true)}
                >
                  Show Details
                </Button>
              )}
            </div>
            {(kgData || factualTriples) && (
              <div className="action-buttons-container">
                {factualTriples && (
                  <Button
                    variant="info"
                    className="show-factual-triples-btn me-2"
                    onClick={handleShowFactualTriples}
                    title="Show Factual Triples"
                  >
                    Show Factual Triples
                  </Button>
                )}
                {kgData && (
                  <Button
                    variant="primary"
                    className="download-json-btn"
                    onClick={handleShowJSON}
                    title="Show Knowledge Graph JSON"
                  >
                    Show JSON
                  </Button>
                )}
              </div>
            )}
            {kgData && (
              <GraphChatInterface kgData={kgData} />
            )}
          </div>
        )}
      </div>
    </Container>
    <ToastContainer position="bottom-start" className="p-3 toast-container">
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        className="generation-toast"
        autohide={false}
      >
        <Toast.Header>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          <strong className="me-auto">Generating Knowledge Graph</strong>
        </Toast.Header>
        <Toast.Body>
          Your data will be available in some time.
        </Toast.Body>
      </Toast>
    </ToastContainer>
    <Modal 
      show={showSchemaModal} 
      onHide={() => setShowSchemaModal(false)}
      size="lg"
      className="schema-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Knowledge Graph Schema</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AllowedTypes 
          entityTypes={entityTypes}
          predicateTypes={predicateTypes}
          metricTypes={metricTypes}
          isLoading={isLoadingSchema}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowSchemaModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    <ViewJSONModal 
      show={showJSONModal}
      onHide={() => setShowJSONModal(false)}
      jsonData={kgData}
    />
    <ViewFactualTriplesModal 
      show={showFactualTriplesModal}
      onHide={() => setShowFactualTriplesModal(false)}
      factualTriples={factualTriples}
    />
    </>
  );
}

export default HomePage;

