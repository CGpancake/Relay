import React from 'react';
import { ChevronDown, GitBranch, Zap } from 'lucide-react';
import styles from './FinanceMap.module.css';
import { entitySummary, financeMapData, flowOrder, getFlowForStep, getStepsByPhase, systemLabel } from './helpers';
import type { FlowId, Step } from './types';

const flowData = financeMapData;

export function FinanceMapFeatureView() {
  const [activeFlowId, setActiveFlowId] = React.useState<FlowId>('flow1');
  const [expandedStepId, setExpandedStepId] = React.useState<string | null>('f1.1');
  const activeFlow = flowData.flows[activeFlowId];

  const openStep = (stepId: string) => {
    const targetFlow = getFlowForStep(flowData, stepId);
    if (!targetFlow) return;
    setActiveFlowId(targetFlow.id);
    setExpandedStepId(stepId);
    window.setTimeout(() => {
      document.querySelector(`[data-finance-step-id="${stepId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 0);
  };

  return (
    <section className={styles.page} aria-label="Finance Map">
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Relay / Finance Map</p>
          <h1>finance map</h1>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Updated</dt>
            <dd>{flowData.meta.lastUpdated}</dd>
          </div>
          <div>
            <dt>Entities</dt>
            <dd>{entitySummary(flowData)}</dd>
          </div>
        </dl>
      </header>

      <nav className={styles.tabs} aria-label="Finance flows">
        {flowOrder.map((flowId) => {
          const flow = flowData.flows[flowId];
          return (
            <button
              aria-pressed={activeFlowId === flowId}
              className={activeFlowId === flowId ? styles.activeTab : styles.tab}
              key={flow.id}
              onClick={() => {
                setActiveFlowId(flow.id);
                setExpandedStepId(flow.steps[0]?.id ?? null);
              }}
              type="button"
            >
              <span>{flow.title}</span>
              <small>{flow.steps.length} steps</small>
            </button>
          );
        })}
      </nav>

      <div className={styles.flowIntro}>
        <div>
          <p className="eyebrow">current flow</p>
          <h2>{activeFlow.title}</h2>
        </div>
        <span>{activeFlow.phases.length} phases</span>
      </div>

      <div className={styles.board} aria-label={`${activeFlow.title} phases`}>
        {activeFlow.phases.map((phase) => {
          const phaseSteps = getStepsByPhase(activeFlow, phase.id);
          return (
            <section className={styles.phase} key={phase.id} aria-label={phase.title}>
              <header className={styles.phaseHeader}>
                <h3>{phase.title}</h3>
                <span>{phaseSteps.length}</span>
              </header>
              <div className={styles.steps}>
                {phaseSteps.map((step) => (
                  <StepCard
                    expanded={expandedStepId === step.id}
                    key={step.id}
                    onCrossFlowJump={openStep}
                    onToggle={() => setExpandedStepId((current) => (current === step.id ? null : step.id))}
                    step={step}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function StepCard({
  expanded,
  onCrossFlowJump,
  onToggle,
  step,
}: {
  expanded: boolean;
  onCrossFlowJump: (stepId: string) => void;
  onToggle: () => void;
  step: Step;
}) {
  return (
    <article className={`${styles.step} ${expanded ? styles.expandedStep : ''}`} data-finance-step-id={step.id}>
      <button aria-expanded={expanded} className={styles.stepButton} onClick={onToggle} type="button">
        <span className={styles.stepTopline}>
          <span className={styles.stepNumber}>{step.num}</span>
          <span className={styles.type}>{step.type}</span>
          {step.automated && (
            <span className={styles.auto} title="Automated">
              <Zap size={11} aria-hidden="true" />
            </span>
          )}
          <ChevronDown className={expanded ? styles.chevronOpen : styles.chevron} size={14} aria-hidden="true" />
        </span>
        <strong>{step.title}</strong>
        <span className={styles.owner}>{step.ownerLabel}</span>
        {step.systems.length > 0 && <span className={styles.systems}>{step.systems.map(systemLabel).join(' / ')}</span>}
      </button>

      {expanded && (
        <div className={styles.detail}>
          <DetailBlock label="Action" value={step.action} />
          {step.entity && <DetailBlock label="Entity" value={step.entity} />}
          <TagBlock label="Data updated" values={step.dataUpdated} />
          <TagBlock label="Docs" values={step.docs} />
          {step.decisionBranches && (
            <div className={styles.block}>
              <h4>Decision branches</h4>
              {step.decisionBranches.map((branch) => (
                <p className={styles.branch} key={`${branch.label}-${branch.target}`}>
                  <strong>{branch.label}</strong> {branch.target}
                </p>
              ))}
            </div>
          )}
          {step.automation && <DetailBlock label="Automation" value={step.automation} />}
          <TagBlock label="Risks" values={step.risks} tone="risk" />
          {step.suggestedFix && <DetailBlock label="Suggested fix" value={step.suggestedFix} />}
          {step.pending && (
            <div className={styles.block}>
              <h4>Pending validation</h4>
              {step.pending.map((pending) => (
                <p key={`${pending.q}-${pending.source}`}>
                  {pending.q}
                  <span>Source: {pending.source}</span>
                </p>
              ))}
            </div>
          )}
          {step.crossFlow && (
            <div className={styles.block}>
              <h4>Cross-flow references</h4>
              {step.crossFlow.map((reference) => (
                <button
                  className={styles.crossLink}
                  disabled={!reference._resolvedStepId}
                  key={`${reference.label}-${reference.target}`}
                  onClick={() => reference._resolvedStepId && onCrossFlowJump(reference._resolvedStepId)}
                  type="button"
                >
                  <GitBranch size={12} aria-hidden="true" />
                  <span>
                    {reference.label}
                    {reference._resolvedStepNum ? ` / Step ${reference._resolvedStepNum}: ${reference._resolvedStepTitle}` : ''}
                  </span>
                  <small>{reference.target}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className={styles.block}>
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  );
}

function TagBlock({ label, tone, values }: { label: string; tone?: 'risk'; values?: string[] }) {
  if (!values?.length) return null;
  return (
    <div className={styles.block}>
      <h4>{label}</h4>
      <div className={styles.tags}>
        {values.map((value) => (
          <span className={tone === 'risk' ? styles.riskTag : styles.tag} key={value}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
