import React from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';

type DocEntry = {
  id: string;
  path: string;
  title: string;
  content: string;
  categories: string[];
};

type DocFolder = {
  name: string;
  path: string;
  folders: DocFolder[];
  docs: DocEntry[];
};

type InlineToken = {
  kind: 'text' | 'code' | 'strong' | 'link' | 'wiki';
  text: string;
  target?: string;
};

const markdownFiles = import.meta.glob<string>('../../Documentation/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

export function DocumentationView() {
  const docs = React.useMemo(() => buildDocs(), []);
  const wikiIndex = React.useMemo(() => buildWikiIndex(docs), [docs]);
  const tree = React.useMemo(() => buildTree(docs), [docs]);
  const [selectedId, setSelectedId] = React.useState(() => docs.find((doc) => doc.id.toLowerCase() === 'welcome')?.id ?? docs[0]?.id ?? '');
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(() => new Set());
  const selectedDoc = docs.find((doc) => doc.id === selectedId) ?? docs[0];

  const toggleFolder = (path: string) => {
    setOpenFolders((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Documentation</p>
          <h1>documentation</h1>
        </div>
        <div className="header-stats">
          <span>{docs.length} pages</span>
          <span>{tree.folders.length} categories</span>
        </div>
      </section>

      <section className="documentation-layout">
        <aside className="documentation-browser" aria-label="Documentation browser">
          <h2>contents</h2>
          {docs.length === 0 ? (
            <p>No markdown files found in Documentation.</p>
          ) : (
            <DocFolderList
              folder={tree}
              level={0}
              onSelectDoc={setSelectedId}
              onToggleFolder={toggleFolder}
              openFolders={openFolders}
              selectedId={selectedDoc?.id ?? ''}
            />
          )}
        </aside>

        <article className="documentation-reader" data-testid="documentation-reader">
          {selectedDoc ? (
            <MarkdownDocument doc={selectedDoc} onSelectDoc={setSelectedId} wikiIndex={wikiIndex} />
          ) : (
            <p>No documentation page selected.</p>
          )}
        </article>
      </section>
    </>
  );
}

function buildDocs(): DocEntry[] {
  return Object.entries(markdownFiles)
    .map(([modulePath, content]) => {
      const relativePath = modulePath.replace(/^.*Documentation\//, '');
      const withoutExtension = relativePath.replace(/\.md$/, '');
      const parts = withoutExtension.split('/');
      const fileName = parts.at(-1) ?? withoutExtension;
      const title = firstHeading(content) ?? titleFromFileName(fileName);
      return {
        id: withoutExtension,
        path: relativePath,
        title,
        content,
        categories: parts.slice(0, -1),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function buildWikiIndex(docs: DocEntry[]) {
  const index = new Map<string, string>();
  for (const doc of docs) {
    const aliases = [doc.id, doc.id.toLowerCase(), doc.title, doc.title.toLowerCase(), doc.id.split('/').at(-1) ?? doc.id];
    for (const alias of aliases) {
      index.set(normalizeWikiTarget(alias), doc.id);
    }
  }
  return index;
}

function buildTree(docs: DocEntry[]): DocFolder {
  const root: DocFolder = { name: 'Documentation', path: '', folders: [], docs: [] };
  const folderMap = new Map<string, DocFolder>([['', root]]);

  for (const doc of docs) {
    let current = root;
    let currentPath = '';
    for (const category of doc.categories) {
      currentPath = currentPath ? `${currentPath}/${category}` : category;
      let next = folderMap.get(currentPath);
      if (!next) {
        next = { name: category, path: currentPath, folders: [], docs: [] };
        folderMap.set(currentPath, next);
        current.folders.push(next);
      }
      current = next;
    }
    current.docs.push(doc);
  }

  sortFolder(root);
  return root;
}

function sortFolder(folder: DocFolder) {
  folder.folders.sort((a, b) => a.name.localeCompare(b.name));
  folder.docs.sort((a, b) => a.title.localeCompare(b.title));
  folder.folders.forEach(sortFolder);
}

function DocFolderList({
  folder,
  level,
  onSelectDoc,
  onToggleFolder,
  openFolders,
  selectedId,
}: {
  folder: DocFolder;
  level: number;
  onSelectDoc: (id: string) => void;
  onToggleFolder: (path: string) => void;
  openFolders: Set<string>;
  selectedId: string;
}) {
  return (
    <div className="documentation-tree">
      {folder.docs.map((doc) => (
        <button
          className={selectedId === doc.id ? 'is-active' : ''}
          key={doc.id}
          onClick={() => onSelectDoc(doc.id)}
          style={{ '--tree-level': level } as React.CSSProperties}
          type="button"
        >
          <FileText size={13} aria-hidden="true" />
          <span>{doc.title}</span>
        </button>
      ))}
      {folder.folders.map((child) => {
        const open = openFolders.has(child.path);
        return (
          <section key={child.path}>
            <button
              className="documentation-folder-toggle"
              onClick={() => onToggleFolder(child.path)}
              style={{ '--tree-level': level } as React.CSSProperties}
              type="button"
            >
              {open ? <ChevronDown size={13} aria-hidden="true" /> : <ChevronRight size={13} aria-hidden="true" />}
              <Folder size={13} aria-hidden="true" />
              <span>{child.name}</span>
            </button>
            {open && (
              <DocFolderList
                folder={child}
                level={level + 1}
                onSelectDoc={onSelectDoc}
                onToggleFolder={onToggleFolder}
                openFolders={openFolders}
                selectedId={selectedId}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

function MarkdownDocument({
  doc,
  onSelectDoc,
  wikiIndex,
}: {
  doc: DocEntry;
  onSelectDoc: (id: string) => void;
  wikiIndex: Map<string, string>;
}) {
  return <>{renderMarkdown(doc.content, doc.id, wikiIndex, onSelectDoc)}</>;
}

function renderMarkdown(content: string, currentDocId: string, wikiIndex: Map<string, string>, onSelectDoc: (id: string) => void) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === '') {
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      nodes.push(React.createElement(`h${level}`, { key: `heading-${index}` }, renderInline(heading[2], currentDocId, wikiIndex, onSelectDoc)));
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      nodes.push(
        <pre key={`code-${index}`}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      index += 1;
      continue;
    }

    if (/^\|.+\|$/.test(line) && /^\|[\s:-]+\|/.test(lines[index + 1] ?? '')) {
      const tableLines = [line];
      index += 2;
      while (index < lines.length && /^\|.+\|$/.test(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      nodes.push(renderTable(tableLines, currentDocId, wikiIndex, onSelectDoc, index));
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item, currentDocId, wikiIndex, onSelectDoc)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
        index += 1;
      }
      nodes.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item, currentDocId, wikiIndex, onSelectDoc)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      nodes.push(<blockquote key={`quote-${index}`}>{renderInline(quoteLines.join(' '), currentDocId, wikiIndex, onSelectDoc)}</blockquote>);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    const paragraphLines = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() !== '' && !isMarkdownBlockStart(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    nodes.push(<p key={`p-${index}`}>{renderInline(paragraphLines.join(' '), currentDocId, wikiIndex, onSelectDoc)}</p>);
  }

  return nodes;
}

function renderTable(
  tableLines: string[],
  currentDocId: string,
  wikiIndex: Map<string, string>,
  onSelectDoc: (id: string) => void,
  keySeed: number,
) {
  const [headerLine, ...bodyLines] = tableLines;
  const headers = splitTableRow(headerLine);
  return (
    <table key={`table-${keySeed}`}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{renderInline(header, currentDocId, wikiIndex, onSelectDoc)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyLines.map((row, rowIndex) => (
          <tr key={`${row}-${rowIndex}`}>
            {splitTableRow(row).map((cell, cellIndex) => (
              <td key={`${cell}-${cellIndex}`}>{renderInline(cell, currentDocId, wikiIndex, onSelectDoc)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderInline(text: string, currentDocId: string, wikiIndex: Map<string, string>, onSelectDoc: (id: string) => void) {
  const tokens = tokenizeInline(text);
  return tokens.map((token, index) => {
    const key = `${token.kind}-${token.text}-${index}`;
    if (token.kind === 'code') {
      return <code key={key}>{token.text}</code>;
    }
    if (token.kind === 'strong') {
      return <strong key={key}>{token.text}</strong>;
    }
    if (token.kind === 'link' && token.target) {
      return (
        <a href={token.target} key={key} rel="noreferrer" target={token.target.startsWith('http') ? '_blank' : undefined}>
          {token.text}
        </a>
      );
    }
    if (token.kind === 'wiki') {
      const targetId = resolveWikiTarget(token.target ?? token.text, currentDocId, wikiIndex);
      if (!targetId) {
        return (
          <span className="wiki-link is-missing" key={key}>
            {token.text}
          </span>
        );
      }
      return (
        <button className="wiki-link" key={key} onClick={() => onSelectDoc(targetId)} type="button">
          {token.text}
        </button>
      );
    }
    return <React.Fragment key={key}>{token.text}</React.Fragment>;
  });
}

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[\[[^\]]+\]\])|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith('`')) {
      tokens.push({ kind: 'code', text: raw.slice(1, -1) });
    } else if (raw.startsWith('**')) {
      tokens.push({ kind: 'strong', text: raw.slice(2, -2) });
    } else if (raw.startsWith('[[')) {
      const inner = raw.slice(2, -2);
      const [target, label] = inner.split('|');
      tokens.push({ kind: 'wiki', text: label ?? target, target });
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(raw);
      if (link) {
        tokens.push({ kind: 'link', text: link[1], target: link[2] });
      }
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ kind: 'text', text: text.slice(lastIndex) });
  }

  return tokens;
}

function resolveWikiTarget(target: string, currentDocId: string, wikiIndex: Map<string, string>) {
  const normalizedTarget = normalizeWikiTarget(target);
  const currentFolder = currentDocId.split('/').slice(0, -1).join('/');
  return wikiIndex.get(normalizedTarget) ?? wikiIndex.get(normalizeWikiTarget(`${currentFolder}/${target}`));
}

function normalizeWikiTarget(target: string) {
  return target.trim().replace(/\.md$/, '').toLowerCase();
}

function firstHeading(content: string) {
  return content
    .split('\n')
    .map((line) => /^#\s+(.+)$/.exec(line))
    .find(Boolean)?.[1];
}

function titleFromFileName(fileName: string) {
  return fileName.replace(/[-_]/g, ' ');
}

function splitTableRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isMarkdownBlockStart(line: string) {
  return /^(#{1,6})\s+/.test(line) || /^```/.test(line) || /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line) || /^>\s?/.test(line);
}
