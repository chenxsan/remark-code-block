import { unified } from 'unified'
import type { Preset } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkCodeBlock } from '.'
import { describe, it, expect } from 'vitest'

import js from 'refractor/lang/javascript'
import html from 'refractor/lang/markup'

describe('remarkCodeBlock', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkCodeBlock, {
      enableLineNumbers: true,
    })
    .use(remarkRehype as Preset)
    .use(rehypeStringify)

  remarkCodeBlock.register(js)
  remarkCodeBlock.register(html)

  it('should highlight code block', () => {
    processor.process(
      `
\`\`\`javascript
console.log('remark code block');


console.log('remark code block');
\`\`\`
`,
      function (err, file) {
        expect(err).toBeNull()
        if (!err) {
          expect(file?.value).toContain(`token punctuation`)

          expect(file?.value).toMatchSnapshot()
        }
      }
    )
  })
  it('should add data-filename to code element', () => {
    processor.process(
      `
\`\`\`html filename=src/pages/hello.html
<p>hello world</p>
\`\`\`
`,
      (err, file) => {
        if (!err) {
          expect(file?.value).toContain('data-filename="src/pages/hello.html"')
          expect(file?.value).toContain('language-html')
          expect(file?.value).toContain('data-lang="html"')

          expect(file?.value).toMatchSnapshot()
        }
      }
    )
  })
  it('should add data-line-number', () => {
    processor.process(
      `
\`\`\`html filename=src/pages/hello.html
<p>hello world</p>

<div>html 5</div>
\`\`\`
`,
      (err, file) => {
        if (!err) {
          expect(file?.value).toContain('data-line-number="1"')
        }
      }
    )
  })
  it('should highlight lines', () => {
    processor.process(
      `
\`\`\`html lines=[1,3]
<p>hello world</p>

<div>html 5</div>
\`\`\`
`,
      (err, file) => {
        if (!err) {
          expect(file?.value).toContain('data-line-highlight')
        }
      }
    )
  })
})
