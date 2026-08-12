import { Check, ShoppingBag, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
}

const steps = [
  { number: 1, title: "Välj tjänst", icon: ShoppingBag },
  { number: 2, title: "Var & När", icon: MapPin },
  { number: 3, title: "Dina uppgifter", icon: User },
];

export function StepIndicator({ currentStep, onStepClick, canNavigateToStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const canClick = canNavigateToStep(step.number);
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => canClick && onStepClick(step.number)}
                disabled={!canClick}
                className={cn(
                  "flex items-center gap-3 transition-all",
                  canClick && "cursor-pointer hover:opacity-80",
                  !canClick && "cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <p className={cn(
                    "text-xs uppercase tracking-wide",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    Steg {step.number}
                  </p>
                  <p className={cn(
                    "font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden flex items-center gap-2 justify-center">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const canClick = canNavigateToStep(step.number);

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => canClick && onStepClick(step.number)}
              disabled={!canClick}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/10 border border-primary text-primary",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                canClick && "cursor-pointer",
                !canClick && "cursor-not-allowed opacity-60"
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 text-center">{step.number}</span>
              )}
              <span className="font-medium">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
