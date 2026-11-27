import { useState, useMemo } from 'react'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js'
import { copyText } from '../lib/toast'

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  py: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  bash: 'Bash',
  sh: 'Bash',
  shell: 'Bash',
  zsh: 'Bash',
  json: 'JSON',
  json5: 'JSON5',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  cs: 'C#',
  csharp: 'C#',
  'c#': 'C#',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  swift: 'Swift',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  perl: 'Perl',
  r: 'R',
  lua: 'Lua',
  dart: 'Dart',
  markdown: 'Markdown',
  md: 'Markdown',
  xml: 'XML',
  svg: 'SVG',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  toml: 'TOML',
  ini: 'INI',
  diff: 'Diff',
  makefile: 'Makefile',
  make: 'Makefile',
}

function formatLanguage(raw: string): string {
  if (!raw) return 'Code'
  const lower = raw.toLowerCase().trim()
  if (LANGUAGE_LABELS[lower]) return LANGUAGE_LABELS[lower]
  if (lower.length <= 4) return lower.toUpperCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && 'props' in node && (node as any).props?.children) {
    return extractText((node as any).props.children)
  }
  return ''
}

export function InlineCode(props: { children?: React.ReactNode }) {
  return (
    <code className="inline-code rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] text-cyan">
      {props.children}
    </code>
  )
}

export function CodeBlock(props: {
  className?: string
  children?: React.ReactNode
  'data-block'?: string | boolean
  [key: string]: any
}) {
  const isBlock = Boolean(props['data-block'])

  // Render inline code if not a block
  if (!isBlock) {
    return <InlineCode>{props.children}</InlineCode>
  }

  const rawCode = extractText(props.children)
  const langMatch = props.className?.match(/(?:^|\s)language-([a-zA-Z0-9_+#.-]+)/)
  const language = langMatch ? langMatch[1] : ''
  const displayLang = formatLanguage(language)

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    // Strip trailing single newline that markdown fences often add
    const codeToCopy = rawCode.endsWith('\n') ? rawCode.slice(0, -1) : rawCode
    const ok = await copyText(codeToCopy)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const highlightedCode = useMemo(() => {
    const cleanCode = rawCode.endsWith('\n') ? rawCode.slice(0, -1) : rawCode
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(cleanCode, { language, ignoreIllegals: true }).value
      } catch {
        // fallback to auto
      }
    }
    try {
      return hljs.highlightAuto(cleanCode).value
    } catch {
      return cleanCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }
  }, [rawCode, language])

  return (
    <div className="aivora-code-block my-4 w-full max-w-full overflow-hidden rounded-xl border border-line-strong bg-[#070b19] shadow-lg">
      {/* Code block header bar */}
      <div className="flex h-10 items-center justify-between border-b border-line bg-surface-2/70 px-3.5 py-1.5 sm:px-4">
        {/* Top-left: Programming language label */}
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            aria-hidden="true"
          />
          <span className="truncate font-mono text-xs font-semibold tracking-wide text-cyan">
            {displayLang}
          </span>
        </div>

        {/* Top-right: Copy Code button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-strong bg-surface/90 px-2.5 py-1 text-xs font-medium text-muted transition hover:border-blue/50 hover:bg-surface-2 hover:text-ink focus:outline-none focus:ring-1 focus:ring-cyan active:scale-95"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
          title="Copy entire code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              <span className="font-sans text-success">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-sans">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code body with horizontal scroll for long lines and vertical scroll for long code */}
      <div className="aivora-code-scroll max-h-[500px] w-full overflow-x-auto overflow-y-auto p-3.5 sm:p-4.5 scrollbar-thin">
        <pre className="m-0 bg-transparent p-0 font-mono text-[0.85rem] leading-relaxed text-[#e2e8f0] sm:text-[0.9rem]">
          <code
            className={`hljs ${language ? `language-${language}` : ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  )
}
