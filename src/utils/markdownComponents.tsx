import type { Components } from 'react-markdown'

export const nudgeMarkdownComponents: Components = {
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '20px', margin: '8px 0', listStyleType: 'disc' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '20px', margin: '8px 0', listStyleType: 'decimal' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '4px', color: 'var(--color-text-primary)' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{children}</strong>
  ),
  p: ({ children }) => (
    <p style={{ margin: '4px 0', color: 'var(--color-text-primary)' }}>{children}</p>
  ),
  table: ({ children }) => (
    <table style={{ borderCollapse: 'collapse', width: '100%', margin: '8px 0' }}>{children}</table>
  ),
  td: ({ children }) => (
    <td
      style={{
        border: '1px solid var(--color-border)',
        padding: '8px',
        color: 'var(--color-text-primary)',
      }}
    >
      {children}
    </td>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid var(--color-border)',
        padding: '8px',
        color: 'var(--color-text-primary)',
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  ),
}

export const reportMarkdownComponents: Components = {
  ...nudgeMarkdownComponents,
  p: ({ children }) => (
    <p style={{ margin: '4px 0', color: '#000000', fontFamily: 'var(--font-body)' }}>{children}</p>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '4px', color: '#000000', fontFamily: 'var(--font-body)' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: '#000000', fontWeight: 600, fontFamily: 'var(--font-body)' }}>{children}</strong>
  ),
}
