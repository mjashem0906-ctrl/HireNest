import React from 'react';
import { Check, Clock, Briefcase, UserCheck, FileText, XCircle } from 'lucide-react';

const steps = [
  { label: "Submitted", icon: FileText },
  { label: "Review", icon: Clock },
  { label: "Interview", icon: UserCheck },
  { label: "Offer", icon: Briefcase },
  { label: "Hired", icon: Check }
];

const StatusPipeline = ({ status }) => {
  // Logic to find the current active step
  let activeIndex = steps.findIndex(s => status && (status.includes(s.label) || s.label === status));
  if (activeIndex === -1) activeIndex = 0;

  const isRejected = status === 'Rejected';

  // --- STYLES (Defined here to ensure Horizontal Layout works) ---
  const styles = {
    container: {
      width: '100%',
      padding: '30px 10px',
      position: 'relative',
      fontFamily: 'sans-serif',
    },
    trackContainer: {
      position: 'relative',
      display: 'flex',            /* forces horizontal layout */
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    bgLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      width: '100%',
      height: '6px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      zIndex: 0,
      transform: 'translateY(-50%)',
    },
    progressLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      height: '6px',
      background: isRejected ? '#ef4444' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
      borderRadius: '4px',
      zIndex: 0,
      transform: 'translateY(-50%)',
      width: isRejected ? '100%' : `${(activeIndex / (steps.length - 1)) * 100}%`,
      transition: 'width 0.8s ease-in-out', /* Smooth fill animation */
    },
    stepWrapper: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10,
    },
    circle: (isActive, isCompleted, isError) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isError ? '#ef4444' : (isActive || isCompleted ? 'white' : 'white'),
      border: `2px solid ${isError ? '#ef4444' : (isActive || isCompleted ? '#4f46e5' : '#e5e7eb')}`,
      color: isError ? 'white' : (isCompleted ? 'white' : (isActive ? '#4f46e5' : '#9ca3af')),
      background: isCompleted && !isError ? '#4f46e5' : 'white', // Fill blue if completed
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy scale effect
      transform: isActive ? 'scale(1.2)' : 'scale(1)',
      boxShadow: isActive ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : 'none',
    }),
    label: (isActive, isError) => ({
      position: 'absolute',
      top: '45px',
      fontSize: '12px',
      fontWeight: isActive ? '700' : '500',
      color: isError ? '#ef4444' : (isActive ? '#4f46e5' : '#9ca3af'),
      textAlign: 'center',
      width: '100px',
      transition: 'color 0.3s ease',
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.trackContainer}>
        
        {/* Grey Background Track */}
        <div style={styles.bgLine}></div>

        {/* Animated Colored Progress Bar */}
        <div style={styles.progressLine}></div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const Icon = step.icon;
          
          // Should we show error state for this specific step?
          const isErrorStep = isRejected && isActive;

          return (
            <div key={index} style={styles.stepWrapper}>
              
              {/* Circle Icon */}
              <div style={styles.circle(isActive, isCompleted, isErrorStep)}>
                {isErrorStep ? (
                  <XCircle size={20} color="white" />
                ) : isCompleted ? (
                  <Check size={18} strokeWidth={3} color="white" />
                ) : (
                  <Icon size={18} />
                )}
              </div>

              {/* Text Label */}
              <div style={styles.label(isActive, isErrorStep)}>
                {isErrorStep ? "Rejected" : step.label}
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusPipeline;