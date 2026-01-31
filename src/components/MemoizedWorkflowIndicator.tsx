import { memo } from 'react';
import { WorkflowIndicator } from '@/components/WorkflowIndicator';

interface MemoizedWorkflowIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export const MemoizedWorkflowIndicator = memo<MemoizedWorkflowIndicatorProps>(({
  currentStep,
  totalSteps,
  onStepClick
}) => {
  return (
    <WorkflowIndicator
      currentStep={currentStep}
      totalSteps={totalSteps}
      onStepClick={onStepClick}
    />
  );
});

MemoizedWorkflowIndicator.displayName = 'MemoizedWorkflowIndicator';
