import { expect, test } from '@playwright/test';
import { buildMetadataGapReport, normalizeScoroProjects, parseCsv } from '../scripts/scoro-metadata.mjs';

test('Scoro CSV projects normalize into local fixture records', () => {
  const csv = [
    'project_id,no,project_name,description,company_id,company_name,status,manager_name,start_date,deadline,budget,tags,custom_fields,deleted',
    '123,P-0042,Harbor Station Launch Film,Launch work,77,Harbor Co,active,Ada Manager,2026-05-01,2026-06-01,12000,"cg; retouch","{""region"":""uk""}",false',
  ].join('\n');

  const projects = normalizeScoroProjects(parseCsv(csv), '2026-05-07T00:00:00.000Z');

  expect(projects).toEqual([
    expect.objectContaining({
      scoroProjectId: '123',
      scoroProjectNumber: 'P-0042',
      name: 'Harbor Station Launch Film',
      companyName: 'Harbor Co',
      status: 'active',
      managerName: 'Ada Manager',
      startDate: '2026-05-01',
      deadline: '2026-06-01',
      tags: ['cg', 'retouch'],
      customFields: { region: 'uk' },
      deleted: false,
      sourceSyncedAt: '2026-05-07T00:00:00.000Z',
    }),
  ]);
});

test('Scoro metadata gap report recommends Relay schema additions', () => {
  const projects = normalizeScoroProjects([
    {
      project_id: 123,
      no: 'P-0042',
      project_name: 'Harbor Station Launch Film',
      company_name: 'Harbor Co',
      status: 'active',
      manager_name: 'Ada Manager',
      deadline: '2026-06-01',
      budget: '12000',
      tags: ['cg'],
    },
  ]);

  const report = buildMetadataGapReport(projects);

  expect(report.projectCount).toBe(1);
  expect(report.relayProjectFields).toEqual(expect.arrayContaining(['id', 'studioId', 'name', 'code', 'tags', 'tools']));
  expect(report.observedScoroFields).toEqual(expect.arrayContaining(['scoroProjectId', 'scoroProjectNumber', 'companyName', 'status', 'managerName', 'deadline', 'budget']));
  expect(report.missingFromRelay).toEqual(expect.arrayContaining(['scoroProjectId', 'client/company', 'status', 'manager', 'sourceSyncedAt']));
});
