import React from 'react';
import { CheckCircle2, Clock, Calendar, Gift, CheckCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const map = {
    APPLIED: {
      label: 'Applied',
      bg: '#f1f5f9',
      color: '#475569',
      border: '#cbd5e1',
      icon: Clock
    },
    SHORTLISTED: {
      label: 'Shortlisted',
      bg: '#eff6ff',
      color: '#1d4ed8',
      border: '#bfdbfe',
      icon: CheckCircle2
    },
    INTERVIEW: {
      label: 'Interview',
      bg: '#fdf4ff',
      color: '#9333ea',
      border: '#f5d0fe',
      icon: Calendar
    },
    OFFERED: {
      label: 'Offer Extended',
      bg: '#fffbeb',
      color: '#d97706',
      border: '#fde68a',
      icon: Gift
    },
    HIRED: {
      label: 'Hired / Accepted',
      bg: '#ecfdf5',
      color: '#047857',
      border: '#a7f3d0',
      icon: CheckCheck
    },
    REJECTED: {
      label: 'Not Selected',
      bg: '#fef2f2',
      color: '#b91c1c',
      border: '#fecaca',
      icon: XCircle
    }
  };

  const current = map[status] || {
    label: status || 'Unknown',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
    icon: Clock
  };

  const Icon = current.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`
      }}
    >
      <Icon size={14} />
      {current.label}
    </span>
  );
}
