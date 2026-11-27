import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Streamdown } from 'streamdown'
import { CodeBlock, InlineCode } from './CodeBlock'

describe('CodeBlock UI component', () => {
  const components = { code: CodeBlock, inlineCode: InlineCode }

  it('renders a formatted programming language label in the top-left', () => {
    const markdown = '```python\nprint("Hello, world!")\n```'
    const html = renderToStaticMarkup(
      React.createElement(Streamdown, { components }, markdown)
    )

    // Language label should be "Python"
    expect(html).toContain('Python')
    expect(html).toContain('aivora-code-block')
  })

  it('renders JavaScript, HTML, CSS, Bash language labels properly', () => {
    const cases = [
      { md: '```javascript\nconsole.log(1);\n```', label: 'JavaScript' },
      { md: '```html\n<div>Test</div>\n```', label: 'HTML' },
      { md: '```css\nbody { color: red; }\n```', label: 'CSS' },
      { md: '```bash\necho "Hello"\n```', label: 'Bash' },
    ]

    for (const { md, label } of cases) {
      const html = renderToStaticMarkup(
        React.createElement(Streamdown, { components }, md)
      )
      expect(html).toContain(label)
    }
  })

  it('includes the Copy Code button with accessible labels and icons', () => {
    const markdown = '```typescript\nconst x: number = 42;\n```'
    const html = renderToStaticMarkup(
      React.createElement(Streamdown, { components }, markdown)
    )

    expect(html).toContain('Copy Code')
    expect(html).toContain('aria-label="Copy code to clipboard"')
  })

  it('renders syntax-highlighted code with highlight.js classes', () => {
    const markdown = '```python\ndef calculate(a, b):\n    return a + b\n```'
    const html = renderToStaticMarkup(
      React.createElement(Streamdown, { components }, markdown)
    )

    // hljs spans should be present
    expect(html).toContain('hljs-keyword')
    expect(html).toContain('def')
    expect(html).toContain('calculate')
  })

  it('handles inline code distinctly without block header or copy button', () => {
    const markdown = 'Here is some `inline code` in a paragraph.'
    const html = renderToStaticMarkup(
      React.createElement(Streamdown, { components }, markdown)
    )

    expect(html).toContain('inline-code')
    expect(html).toContain('inline code')
    expect(html).not.toContain('Copy Code')
    expect(html).not.toContain('aivora-code-block')
  })

  it('has scrolling container classes for horizontal and vertical scrolling', () => {
    const markdown = '```bash\n' + 'a'.repeat(300) + '\n```'
    const html = renderToStaticMarkup(
      React.createElement(Streamdown, { components }, markdown)
    )

    expect(html).toContain('aivora-code-scroll')
    expect(html).toContain('overflow-x-auto')
    expect(html).toContain('max-h-[500px]')
    expect(html).toContain('overflow-y-auto')
  })
})

describe('Composer Prompt Box UI component', () => {
  it('renders with clean aivora-composer container and custom textarea styling', async () => {
    const { Composer } = await import('./Composer')
    const html = renderToStaticMarkup(
      React.createElement(Composer, {
        value: '',
        onChange: () => {},
        onSubmit: () => {},
        placeholder: 'Ask anything…',
        large: true,
      })
    )

    // Check single clean container
    expect(html).toContain('aivora-composer')
    expect(html).toContain('aivora-composer-textarea')
    expect(html).toContain('placeholder="Ask anything…"')
    // Microphone button present
    expect(html).toContain('aria-label="Start voice input"')
    // Send button present
    expect(html).toContain('aria-label="Send message"')
  })

  it('displays clearly visible placeholder text and proper attributes', async () => {
    const { Composer } = await import('./Composer')
    const html = renderToStaticMarkup(
      React.createElement(Composer, {
        value: 'Hello Aivora',
        onChange: () => {},
        onSubmit: () => {},
        placeholder: 'Test placeholder',
      })
    )

    expect(html).toContain('Hello Aivora')
    expect(html).toContain('placeholder:text-muted/80')
  })
})
