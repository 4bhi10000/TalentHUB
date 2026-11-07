import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function EligibilityBadge({ eligibility }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!eligibility) return null;

  const { isEligible, reasons } = eligibility;

  return (
    <div className="position-relative d-inline-block">
      <span
        className={isEligible ? 'badge-eligible' : 'badge-ineligible'}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: reasons && reasons.length > 0 ? 'pointer' : 'default' }}
      >
        {isEligible ? (
          <>
            <CheckCircle size={14} />
            Eligible
          </>
        ) : (
          <>
            <AlertTriangle size={14} />
            Ineligible
            <Info size={12} className="ms-1 opacity-75" />
          </>
        )}
      </span>

      {showTooltip && reasons && reasons.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            width: '240px',
            background: '#1e293b',
            color: '#ffffff',
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.725rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
          }}
        >
          <div className="fw-bold mb-1">
            {isEligible ? 'Eligibility Criteria Met' : 'Eligibility Criteria Not Met:'}
          </div>
          <ul className="mb-0 ps-3">
            {reasons.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
