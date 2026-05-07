export function parseCsv(input: string): Record<string, string>[];
export function normalizeScoroProjects(records: Record<string, unknown>[], syncedAt?: string): Record<string, unknown>[];
export function buildMetadataGapReport(projects: Record<string, unknown>[]): {
  generatedAt: string;
  source: string;
  projectCount: number;
  relayProjectFields: string[];
  scoroReferenceFields: string[];
  observedScoroFields: string[];
  relayCoverage: Record<string, string>;
  missingFromRelay: string[];
  recommendations: string[];
};
export function loadScoroProjectFile(path: string): Promise<Record<string, unknown>[]>;
