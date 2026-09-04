import React from 'react';
import { CheckCircle2, Image as ImageIcon, FileSpreadsheet, LayoutGrid, Eye, Download } from 'lucide-react';

export type StepNumber = 1 | 2 | 3 | 4 | 5;

interface StepIndicatorProps {
  currentStep: StepNumber;
  completedSteps: Set<StepNumber>;
  onStepClick: (step: StepNumber) => void;
}

const STEPS: { number: StepNumber; label: string; icon: React.FC<{ className?: string }> }[] = [
  { number: 1, label: 'Template', icon: ImageIcon },
  { number: 2, label: 'Data', icon: FileSpreadsheet },
  { number: 3, label: 'Fields', icon: LayoutGrid },
  { number: 4, label: 'Preview', icon: Eye },
  { number: 5, label: 'Generate', icon: Download },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.number;
          const isCompleted = completedSteps.has(step.number);
          const isClickable = isCompleted || step.number <= Math.max(...Array.from(completedSteps), 1);

          return (
            <React.Fragment key={step.number}>
              {/* Step Button */}
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                  isCurrent
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/30'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                <span className="hidden sm:inline-block">
                  {step.label}
                </span>

                <Icon className={`w-4 h-4 sm:hidden ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
              </button>

              {/* Step Divider */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full hidden xs:block ${
                    step.number < currentStep || isCompleted ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
