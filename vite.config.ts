import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const demoElementsRoot = path.resolve(process.cwd(), 'Demo_Versions', 'Elements');
const demoRoutePrefix = '/demo-review/elements';

export type DemoReviewVersionManifest = {
  id: string;
  label: string;
  date: string;
  kind: 'image';
  summary: string;
  projectId: string;
  shotId: string;
  frameStart: number;
  frameEnd: number;
  defaultFrame: number;
  thumbnailUrl: string;
  proxyFrameUrlTemplate: string;
};

export type DemoReviewManifest = {
  source: string;
  versions: DemoReviewVersionManifest[];
};

export function scanElementsManifest(root = demoElementsRoot): DemoReviewManifest {
  if (!fs.existsSync(root)) {
    return { source: 'Demo_Versions/Elements', versions: [] };
  }

  const versions = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^V\d+$/i.test(entry.name))
    .map((entry) => {
      const versionFolder = entry.name;
      const versionNumber = Number.parseInt(versionFolder.slice(1), 10);
      const versionLabel = `V${String(versionNumber).padStart(2, '0')}`;
      const folder = path.join(root, versionFolder);
      const files = fs
        .readdirSync(folder, { withFileTypes: true })
        .filter((file) => file.isFile())
        .map((file) => file.name)
        .map((filename) => {
          const match = filename.match(new RegExp(`^Elements_${versionLabel}\\.(\\d+)\\.png$`, 'i'));
          return match ? { filename, frame: Number.parseInt(match[1], 10) } : null;
        })
        .filter((file): file is { filename: string; frame: number } => Boolean(file))
        .sort((a, b) => a.frame - b.frame);

      if (files.length === 0) {
        return null;
      }

      const frameStart = files[0].frame;
      const frameEnd = files[files.length - 1].frame;
      const defaultFrame = frameEnd;
      const finalFilename = files[files.length - 1].filename;
      const templateFilename = files[0].filename.replace(String(frameStart), '{frame}');
      return {
        id: `elements-${versionLabel.toLowerCase()}`,
        label: versionLabel,
        date: '2026-05-15',
        kind: 'image' as const,
        summary: `Elements ${versionLabel} review sequence`,
        projectId: 'novartis-novartis',
        shotId: 'SH_09',
        frameStart,
        frameEnd,
        defaultFrame,
        thumbnailUrl: `${demoRoutePrefix}/${encodeURIComponent(versionFolder)}/${encodeURIComponent(finalFilename)}`,
        proxyFrameUrlTemplate: `${demoRoutePrefix}/${encodeURIComponent(versionFolder)}/${templateFilename}`,
      };
    })
    .filter((version): version is DemoReviewVersionManifest => Boolean(version))
    .sort((a, b) => Number.parseInt(a.label.slice(1), 10) - Number.parseInt(b.label.slice(1), 10));

  return { source: 'Demo_Versions/Elements', versions };
}

function sendJson(response: ServerResponse, payload: unknown) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function sendNotFound(response: ServerResponse) {
  response.statusCode = 404;
  response.end('Not found');
}

function serveDemoReviewMedia(request: IncomingMessage, response: ServerResponse, next: () => void) {
  const url = request.url?.split('?')[0] ?? '';
  if (url === `${demoRoutePrefix}/manifest.json`) {
    sendJson(response, scanElementsManifest());
    return;
  }

  if (!url.startsWith(`${demoRoutePrefix}/`)) {
    next();
    return;
  }

  const relative = url.slice(`${demoRoutePrefix}/`.length);
  const [encodedVersion, encodedFilename] = relative.split('/');
  if (!encodedVersion || !encodedFilename) {
    sendNotFound(response);
    return;
  }

  const version = decodeURIComponent(encodedVersion);
  const filename = decodeURIComponent(encodedFilename);
  if (!/^V\d+$/i.test(version) || !/^Elements_v\d+\.\d+\.png$/i.test(filename)) {
    sendNotFound(response);
    return;
  }

  const resolved = path.resolve(demoElementsRoot, version, filename);
  const allowedRoot = path.resolve(demoElementsRoot) + path.sep;
  if (!resolved.startsWith(allowedRoot) || !fs.existsSync(resolved)) {
    sendNotFound(response);
    return;
  }

  response.statusCode = 200;
  response.setHeader('Content-Type', 'image/png');
  fs.createReadStream(resolved).pipe(response);
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'relay-demo-review-media',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use(serveDemoReviewMedia);
      },
    },
  ],
});
