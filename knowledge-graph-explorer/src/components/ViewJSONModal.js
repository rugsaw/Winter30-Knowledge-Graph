import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ViewJSONModal.scss';

function ViewJSONModal({ show, onHide, jsonData }) {
  const [copied, setCopied] = useState(false);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!show) {
      setCopied(false);
    }
  }, [show]);

  const handleDownload = () => {
    if (!jsonData) return;

    try {
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading JSON:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!jsonData) return;

    try {
      const jsonString = JSON.stringify(jsonData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(jsonData, null, 2);
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

  const formattedJson = jsonData ? JSON.stringify(jsonData, null, 2) : '';

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      className="view-json-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Knowledge Graph JSON</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="json-display-container">
          <pre className="json-content">{formattedJson}</pre>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="outline-primary" 
          onClick={handleCopyToClipboard}
          disabled={!jsonData}
          className="copy-btn"
        >
          <span className="copy-icon">{copied ? '✓' : '📋'}</span> {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          <span className="download-icon">⬇</span> Download JSON
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewJSONModal;

