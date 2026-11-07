import React from 'react';
import { Check, X, Clock, Award } from 'lucide-react';

const STEPS = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFERED', label: 'Offer' },
  { key: 'HIRED', label: 'Hired' }
];

export default function ApplicationStepper({ currentStatus }) {
  const isRejected = currentStatus === 'REJECTED';

  // Determine active step index
  let currentIndex = STEPS.findIndex(s => s.key === currentStatus);
  if (isRejected) {
    currentIndex = -1; // special handling for rejected
  }

  const progressPercent = currentIndex >= 0 
    ? (currentIndex / (STEPS.length - 1)) * 100 
    : 0;

  return (
    <div className="stepper-container">
      <div className="stepper-line"></div>
      {!isRejected && (
        <div
          className="stepper-progress"
          style={{ width: `calc(${progressPercent}% * 0.85)` }}
        ></div>
      )}

      {STEPS.map((step, idx) => {
        let stepClass = 'stepper-step';
        let isCompleted = !isRejected && idx < currentIndex;
        let isActive = !isRejected && idx === currentIndex;

        if (isCompleted) stepClass += ' completed';
        if (isActive) stepClass += ' active';

        return (
          <div key={step.key} className={stepClass}>
            <div className="stepper-circle">
              {isCompleted ? (
                <Check size={18} />
              ) : isActive ? (
                idx === 4 ? <Award size={18} /> : <Clock size={16} />
              ) : (
                idx + 1
              )}
            </div>
            <div className="stepper-label">{step.label}</div>
          </div>
        );
      })}

      {isRejected && (
        <div className="stepper-step rejected ms-2">
          <div className="stepper-circle">
            <X size={18} />
          </div>
          <div className="stepper-label text-danger">Not Selected</div>
        </div>
      )}
    </div>
  );
}
