import { useState } from "react";
import { CenterPanel } from "./CenterPanel";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import {
  CONVERSION_STEPS,
  MOBILE_PANELS,
  type ConversionStepId,
  type MobilePanelId,
} from "./WorkspaceShell.types";

export interface WorkspaceShellProps {
  activeStep?: ConversionStepId;
}

function getStepStatus(
  stepId: ConversionStepId,
  activeStep: ConversionStepId
): "done" | "active" | "pending" {
  const stepOrder = CONVERSION_STEPS.map((s) => s.id);
  const activeIndex = stepOrder.indexOf(activeStep);
  const stepIndex = stepOrder.indexOf(stepId);

  if (stepIndex < activeIndex) return "done";
  if (stepIndex === activeIndex) return "active";
  return "pending";
}

export function WorkspaceShell({ activeStep = "uploading" }: WorkspaceShellProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanelId>("center");

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div className="workspace-header__brand">
          <div className="workspace-header__logo" aria-hidden="true">
            AI
          </div>
          <div>
            <h1 className="workspace-header__title">회의 분석 워크스페이스</h1>
            <p className="workspace-header__subtitle">녹취 · 변환 · 회의록</p>
          </div>
        </div>

        <nav className="conversion-steps" aria-label="변환 단계">
          {CONVERSION_STEPS.map((step, index) => {
            const status = getStepStatus(step.id, activeStep);
            return (
              <span key={step.id} style={{ display: "contents" }}>
                {index > 0 && (
                  <span className="conversion-step__connector" aria-hidden="true" />
                )}
                <span
                  className={`conversion-step${
                    status === "active" ? " conversion-step--active" : ""
                  }${status === "done" ? " conversion-step--done" : ""}`}
                  aria-current={status === "active" ? "step" : undefined}
                >
                  <span className="conversion-step__dot" aria-hidden="true" />
                  {step.label}
                </span>
              </span>
            );
          })}
        </nav>
      </header>

      <nav className="mobile-tabs" aria-label="모바일 패널 전환">
        {MOBILE_PANELS.map((panel) => (
          <button
            key={panel.id}
            type="button"
            className={`mobile-tab${
              mobilePanel === panel.id ? " mobile-tab--active" : ""
            }`}
            aria-current={mobilePanel === panel.id ? "page" : undefined}
            onClick={() => setMobilePanel(panel.id)}
          >
            {panel.label}
          </button>
        ))}
      </nav>

      <div className="workspace-body">
        <LeftPanel mobileActive={mobilePanel === "left"} />
        <CenterPanel mobileActive={mobilePanel === "center"} />
        <RightPanel mobileActive={mobilePanel === "right"} />
      </div>
    </div>
  );
}

export {
  CONVERSION_STEPS,
  MOBILE_PANELS,
  type ConversionStepId,
  type MobilePanelId,
  type ResultTabId,
} from "./WorkspaceShell.types";
