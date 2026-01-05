import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ViewFactualTriplesModal.scss';

function ViewFactualTriplesModal({ show, onHide, factualTriples }) {
  const [copied, setCopied] = useState(false);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!show) {
      setCopied(false);
    }
  }, [show]);

  const handleDownload = () => {
    if (!factualTriples) return;

    try {
      const blob = new Blob([factualTriples], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factual-triples-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading factual triples:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!factualTriples) return;

    try {
      await navigator.clipboard.writeText(factualTriples);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = factualTriples;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="view-factual-triples-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Factual Triples</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="factual-triples-display-container">
          <pre className="factual-triples-content">{factualTriples || 'No factual triples available.'}</pre>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="outline-primary" 
          onClick={handleCopyToClipboard}
          disabled={!factualTriples}
          className="copy-btn"
        >
          <span className="copy-icon">{copied ? '✓' : '📋'}</span> {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        <Button variant="primary" onClick={handleDownload} disabled={!factualTriples}>
          <span className="download-icon">⬇</span> Download TXT
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewFactualTriplesModal;

