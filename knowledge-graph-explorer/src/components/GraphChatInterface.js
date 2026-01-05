import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { kgService } from '../services/kg.service';
import { messageBus } from '../utils/pubsub';
import './GraphChatInterface.scss';

function GraphChatInterface({ kgData }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to query events
  useEffect(() => {
    const handleQuerySuccess = (event) => {
      setIsLoading(false);
      setError(null);
      const { query, answer } = event.data;
      setMessages(prev => [
        ...prev,
        { type: 'assistant', content: answer, query }
      ]);
    };

    const handleQueryError = async (event) => {
      setIsLoading(false);
      let errorMsg = 'An error occurred while querying the knowledge graph.';
      
      // Try to extract error message from errorPromise if it exists
      if (event.data?.errorPromise) {
        try {
          const errorData = await event.data.errorPromise;
          errorMsg = errorData?.detail || errorData?.message || errorMsg;
        } catch (e) {
          errorMsg = 'Failed to get response. Please try again.';
        }
      } else if (event.data?.status === 404) {
        errorMsg = 'No knowledge graph available. Please generate a knowledge graph first.';
      }
      
      setError(errorMsg);
      setMessages(prev => [
        ...prev,
        { type: 'assistant', content: errorMsg, isError: true }
      ]);
    };

    // Subscribe to events
    const subscriptionId = messageBus.subscribe('app__kg', (event) => {
      if (event.event_name === 'KG_QUERY_SUCCESS') {
        handleQuerySuccess(event);
      } else if (event.event_name === 'KG_QUERY_ERROR') {
        handleQueryError(event);
      }
    });

    return () => {
      messageBus.unsubscribe('app__kg', subscriptionId);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    if (!kgData) {
      setError('No knowledge graph available. Please generate a graph first.');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    // Query the knowledge graph
    kgService.queryKG(userMessage);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    kgService.clearConversation();
  };

  return (
    <div className="graph-chat-interface">
      <div className="chat-header">
        <h4>Query Knowledge Graph</h4>
        {messages.length > 0 && (
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={handleClearChat}
          >
            Clear Chat
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="danger" className="chat-error" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <p>Ask questions about your knowledge graph!</p>
            <p className="text-muted">Example: "What entities are in the graph?" or "What are the revenue measurements?"</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.type} ${message.isError ? 'error' : ''}`}>
            <div className="message-content">
              {message.type === 'user' ? (
                <div className="user-message">
                  <strong>You:</strong> {message.content}
                </div>
              ) : (
                <div className="assistant-message">
                  <strong>Assistant:</strong>
                  <div className="answer-text">{message.content}</div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant loading">
            <div className="message-content">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <Form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-container">
          <Form.Control
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about the knowledge graph..."
            disabled={isLoading || !kgData}
            className="chat-input"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !inputValue.trim() || !kgData}
            className="chat-send-btn"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default GraphChatInterface;

