import React from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import './AllowedTypes.scss';

function AllowedTypes({ entityTypes, predicateTypes, metricTypes, isLoading }) {
  if (isLoading) {
    return (
      <div className="allowed-types-loading">
        <Spinner animation="border" role="status" className="me-2">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <span>Loading schema...</span>
      </div>
    );
  }

  return (
    <div className="allowed-types-container">
      <div className="schema-section">
        <h5 className="schema-section-title">Allowed Entity Types</h5>
        <div className="type-list">
          {entityTypes && entityTypes.length > 0 ? (
            entityTypes.map((type, idx) => (
              <Badge key={idx} bg="success" className="schema-badge">
                {type}
              </Badge>
            ))
          ) : (
            <p className="text-muted">No entity types available</p>
          )}
        </div>
      </div>

      <div className="schema-section">
        <h5 className="schema-section-title">Allowed Predicate Types</h5>
        <div className="type-list">
          {predicateTypes && predicateTypes.length > 0 ? (
            predicateTypes.map((type, idx) => (
              <Badge key={idx} bg="success" className="schema-badge">
                {type}
              </Badge>
            ))
          ) : (
            <p className="text-muted">No predicate types available</p>
          )}
        </div>
      </div>

      <div className="schema-section">
        <h5 className="schema-section-title">Allowed Metric Types</h5>
        <div className="type-list">
          {metricTypes && metricTypes.length > 0 ? (
            metricTypes.map((type, idx) => (
              <Badge key={idx} bg="success" className="schema-badge">
                {type}
              </Badge>
            ))
          ) : (
            <p className="text-muted">No metric types available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllowedTypes;

