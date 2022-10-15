import { visit } from 'unist-util-visit'
import type { Parent } from 'unist'
import { refractor, RefractorElement, Text } from 'refractor/lib/core.js'
import type { BuildVisitor } from 'unist-util-visit/complex-types.js'
import type { Code } from 'mdast'
import type { Properties } from 'hast'
import { splitTextsByNewLine } from './splitTextsByNewLine.js'
import rangeParser from 'parse-numeric-range'

const { register } = refractor

interface Options {
  enableLineNumbers: boolean
}
export const remarkCodeBlock = <Tree extends Parent & Code>(
  options: Options
) => {
  const { enableLineNumbers = true } = options
  const codeVisitor: BuildVisitor<Tree, 'code'> = (node) => {
    const languages = refractor.listLanguages()

    const { lang } = node
    // no need to highlight since we have no idea what language is it
    if (!lang) return
    if (!languages.includes(lang)) {
      // lang is not registered yet
      console.warn(`${lang} is not registered yet`)
      return
    }

    node.data = node.data ?? {}

    node.data.hProperties = node.data.hProperties || {}
    ;(node.data.hProperties as Properties)['data-lang'] = lang

    let ast: (RefractorElement | Text)[]
    let highlightedLines: number[] = []

    // note that mast-util-to-hast will add `language-${lang}` to `code` per https://github.com/syntax-tree/mdast-util-to-hast/blob/7d20e86fbb0d8517497a0651dfcb229a6091a0c7/lib/handlers/code.js#L22

    // handle meta
    const { meta } = node
    if (meta) {
      const params = new URLSearchParams(meta.split(/\s+/).join('&'))
      const filename = params.get('filename')
      if (filename) {
        ;(node.data.hProperties as Properties)['data-filename'] = filename
      }

      // handle line highlight
      const lines = params.get('lines')
      if (lines) {
        if (enableLineNumbers === false) {
          console.warn(
            `Please enable 'enableLineNumbers' option to use line highlighting feature`
          )
        }
        highlightedLines = parseLines(lines)
      }
    }

    if (enableLineNumbers) {
      ast = splitTextsByNewLine(node.value)
        .map((lineText) => refractor.highlight(lineText, lang).children)
        .map((node, index) => ({
          type: 'element',
          tagName: 'span',
          children: node,
          properties: {
            dataLineNumber: index + 1,
            ...(highlightedLines.includes(index + 1)
              ? {
                  dataLineHighlight: true,
                }
              : {}),
          },
        }))
    } else {
      ast = refractor.highlight(node.value, lang).children
    }

    // https://github.com/syntax-tree/mdast-util-to-hast/blob/a5c2f078fc219619eedd174ca857dd11e23abd4b/readme.md#fields-on-nodes
    node.data.hChildren = ast
  }

  return (tree: Tree) => {
    visit(tree, 'code', codeVisitor)
  }
}
remarkCodeBlock.register = (lang: Parameters<typeof register>[0]) =>
  register(lang)

function parseLines(linesParam: string): number[] {
  const lines = linesParam.match(/^\[(.+)\]$/)
  if (!lines) {
    return []
  } else {
    return rangeParser(lines[1])
  }
}
