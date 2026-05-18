import type { Flow, FlowData, FlowId, Step, SystemKey } from './types';
import { FLOW_DATA } from './flowData';
import { SYSTEM_BADGES } from './types';

export const financeMapData = FLOW_DATA;
export const flowOrder: FlowId[] = ['flow1', 'flow2', 'flow3'];

export function getFlows(data: FlowData = financeMapData): Flow[] {
  return flowOrder.map((flowId) => data.flows[flowId]);
}

export function getStepsByPhase(flow: Flow, phaseId: string): Step[] {
  return flow.steps.filter((step) => step.phase === phaseId);
}

export function getFlowForStep(data: FlowData, stepId: string): Flow | undefined {
  return getFlows(data).find((flow) => flow.steps.some((step) => step.id === stepId));
}

export function systemLabel(system: SystemKey) {
  return SYSTEM_BADGES[system]?.label ?? system;
}

export function entitySummary(data: FlowData) {
  const active = data.meta.entities.filter((entity) => entity.active === true);
  const currencies = [...new Set(active.map((entity) => entity.currency))].sort().join(' + ');
  return `${active.length} entities / ${currencies}`;
}
