import {
  ComparisonMatrixRow,
  StructuredComparisonMatrix,
} from '@/types/comparisonMatrix';

/**
 * Parse a markdown table or JSON string into a StructuredComparisonMatrix
 */
export function parseMarkdownTableToMatrix(
  raw: string,
  fallbackTitle = 'Comparative Benchmark Matrix'
): StructuredComparisonMatrix {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.properties) &&
      Array.isArray(parsed.rows)
    ) {
      return parsed as StructuredComparisonMatrix;
    }
  } catch {
    // Parse from markdown table string
  }

  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && l.endsWith('|'));

  if (lines.length < 2) {
    return {
      id: `matrix-${Math.random().toString(36).substring(2, 8)}`,
      title: fallbackTitle,
      properties: ['Description'],
      rows: [
        {
          studyId: 'entry-1',
          studyTitle: 'Summary',
          properties: { Description: raw.slice(0, 120) },
        },
      ],
      markdownTable: raw,
    };
  }

  // Parse header
  const headerParts = lines[0]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);

  const [, ...propertyCols] = headerParts;
  const properties = propertyCols.length > 0 ? propertyCols : ['Details'];

  const rows: ComparisonMatrixRow[] = [];
  // Skip separator line (lines[1])
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .map((cell) => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    if (cells.length > 0) {
      const studyName = cells[0] || `Study ${i - 1}`;
      const propValues: Record<string, string> = {};

      properties.forEach((prop, propIdx) => {
        propValues[prop] = cells[propIdx + 1] || '—';
      });

      rows.push({
        studyId: `study-${i - 1}`,
        studyTitle: studyName,
        properties: propValues,
      });
    }
  }

  return {
    id: `matrix-${Math.random().toString(36).substring(2, 8)}`,
    title: fallbackTitle,
    properties,
    rows,
    markdownTable: raw,
  };
}

/**
 * Convert a StructuredComparisonMatrix into standard academic Markdown
 */
export function matrixToMarkdown(matrix: StructuredComparisonMatrix): string {
  if (!matrix.properties.length || !matrix.rows.length) {
    return matrix.markdownTable || '';
  }

  const header = ['Study / Method', ...matrix.properties];
  const separator = header.map(() => '---');
  const rows = matrix.rows.map((row) => {
    const cells = [
      row.studyTitle,
      ...matrix.properties.map((p) => row.properties[p] || '—'),
    ];
    return `| ${cells.join(' | ')} |`;
  });

  return [
    `| ${header.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...rows,
  ].join('\n');
}

/**
 * Generate publication-grade LaTeX tabular code for Overleaf and camera-ready papers
 */
export function matrixToLatex(matrix: StructuredComparisonMatrix): string {
  const colSpec = `l${'c'.repeat(matrix.properties.length)}`;

  const header = [
    '\\textbf{Method / Study}',
    ...matrix.properties.map((p) => `\\textbf{${p}}`),
  ].join(' & ');

  const rows = matrix.rows
    .map((row) => {
      const escapedTitle = row.studyTitle.replace(/[_#%$&]/g, '\\$&');
      const cells = [
        escapedTitle,
        ...matrix.properties.map((p) =>
          (row.properties[p] || '---').replace(/[_#%$&]/g, '\\$&')
        ),
      ];
      return `  ${cells.join(' & ')} \\\\`;
    })
    .join('\n');

  return `\\begin{table*}[t]
\\centering
\\caption{Comparative evaluation benchmark matrix for ${matrix.title}.}
\\label{tab:${matrix.id}}
\\begin{tabular}{${colSpec}}
  \\toprule
  ${header} \\\\
  \\midrule
${rows}
  \\bottomrule
\\end{tabular}
\\end{table*}`;
}

/**
 * Format a matrix into a clean context summary for downstream writing assistants
 */
export function formatMatrixForChat(
  matrix: StructuredComparisonMatrix
): string {
  return `### Comparative Matrix: ${matrix.title}\n\n${matrixToMarkdown(matrix)}`;
}
