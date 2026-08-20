import { cn } from "@/lib/utils";
import { resolvePipeline, type PipelineStage } from "@/features/applications/stages";

export function ApplicationStepper({ app, stages }: { app?: any; stages?: PipelineStage[] }) {
  const steps = stages ?? resolvePipeline(app);
  return (
    <div className="app-stepper overflow-x-auto pt-2 pb-1">
      <ol className="flex min-w-[820px] w-full">
        {steps.map((step, i) => {
          const done = step.status === "completed";
          const current = step.status === "in_progress";
          return (
            <li key={step.stage_key + i} className="relative flex flex-1 flex-col items-center text-center px-1">
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute top-[11px] left-[calc(50%+12px)] right-[calc(-50%+12px)] h-[2px]",
                    done ? "bg-primary" : "bg-[#d4d4d4]",
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid h-[22px] w-[22px] place-items-center rounded-full border text-[10px] font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !current && "border-[#c8c8c8] bg-[#efefef] text-[#6b6b6b]",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "mt-2 max-w-[108px] text-[9px] font-semibold uppercase leading-tight tracking-[0.04em]",
                  current || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.stage_label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
