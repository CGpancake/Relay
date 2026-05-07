import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const relayProjectFields = ['id', 'studioId', 'name', 'code', 'tags', 'tools', 'archivedAt'];

const scoroProjectFields = [
  'project_id',
  'no',
  'project_name',
  'description',
  'company_id',
  'company_name',
  'status',
  'manager_id',
  'manager_name',
  'start_date',
  'deadline',
  'budget',
  'budget_used',
  'project_accounts',
  'custom_fields',
  'deleted',
  'users',
  'tags',
  'source_synced_at',
];

export function parseCsv(input) {
  const rows = [];
  let cell = '';
  let row = [];
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row);
  }

  const [headers = [], ...records] = rows;
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), record[index]?.trim() ?? ''])),
  );
}

export function normalizeScoroProjects(records, syncedAt = new Date().toISOString()) {
  return records.map((record) => ({
    scoroProjectId: String(record.project_id ?? record.id ?? '').trim(),
    scoroProjectNumber: String(record.no ?? record.project_no ?? '').trim(),
    name: String(record.project_name ?? record.name ?? '').trim(),
    description: String(record.description ?? '').trim(),
    companyId: String(record.company_id ?? '').trim(),
    companyName: String(record.company_name ?? '').trim(),
    status: String(record.status ?? '').trim(),
    managerId: String(record.manager_id ?? '').trim(),
    managerName: String(record.manager_name ?? '').trim(),
    startDate: String(record.start_date ?? '').trim(),
    deadline: String(record.deadline ?? record.end_date ?? '').trim(),
    budget: String(record.budget ?? '').trim(),
    budgetUsed: String(record.budget_used ?? '').trim(),
    tags: splitList(record.tags),
    customFields: parseMaybeJson(record.custom_fields),
    deleted: normalizeBoolean(record.deleted),
    sourceSyncedAt: syncedAt,
  }));
}

export function buildMetadataGapReport(projects) {
  const observedScoroFields = [
    ...new Set(projects.flatMap((project) => Object.keys(project).filter((key) => hasValue(project[key])))),
  ].sort();
  const relayCoverage = {
    name: 'project_name',
    code: 'no',
    archivedAt: 'deleted',
  };
  const likelyAdditions = [
    'scoroProjectId',
    'scoroProjectNumber',
    'client/company',
    'status',
    'manager',
    'startDate/deadline',
    'budget and project account fields',
    'tags from Scoro',
    'customFields',
    'deleted/source state',
    'sourceSyncedAt',
  ];

  return {
    generatedAt: new Date().toISOString(),
    source: 'Scoro API v2 or CSV export',
    projectCount: projects.length,
    relayProjectFields,
    scoroReferenceFields: scoroProjectFields,
    observedScoroFields,
    relayCoverage,
    missingFromRelay: likelyAdditions,
    recommendations: [
      'Keep Relay project identity keyed by full project name in UI; store Scoro project_id and no as non-visible metadata.',
      'Add client/company, status, manager, dates, budget/account fields, tags, custom fields, deleted state, and source sync timestamps before enabling two-way sync.',
      'Load API credentials from ignored local environment only; do not commit API keys or account exports.',
    ],
  };
}

export async function loadScoroProjectFile(path) {
  const input = await readFile(path, 'utf8');
  if (path.endsWith('.json')) {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : parsed.projects ?? parsed.data ?? [];
  }
  return parseCsv(input);
}

async function main(argv) {
  const args = parseArgs(argv);
  if (!args.input) {
    throw new Error('Usage: node scripts/scoro-metadata.mjs --input <projects.csv|projects.json> --fixture <out.json> --report <report.json>');
  }

  const records = await loadScoroProjectFile(resolve(args.input));
  const projects = normalizeScoroProjects(records);
  const report = buildMetadataGapReport(projects);

  if (args.fixture) {
    await writeJson(args.fixture, { source: 'Scoro API v2 or CSV export', projects });
  }
  if (args.report) {
    await writeJson(args.report, report);
  }

  return { projects, report };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') args.input = argv[++index];
    if (arg === '--fixture') args.fixture = argv[++index];
    if (arg === '--report') args.report = argv[++index];
  }
  return args;
}

async function writeJson(path, data) {
  const absolutePath = resolve(path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(data, null, 2)}\n`);
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  return String(value ?? '')
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMaybeJson(value) {
  if (!value || typeof value !== 'string') {
    return value ?? {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  return ['1', 'true', 'yes', 'deleted'].includes(String(value ?? '').toLowerCase());
}

function hasValue(value) {
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).length > 0;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
