import { it } from 'vitest'
import { expect } from 'vitest'
import { describe } from 'vitest'
import { splitTextsByNewLine } from './splitTextsByNewLine.js'
describe('splitTextsByNewLine', () => {
  it('should split texts', () => {
    expect(
      splitTextsByNewLine(
        `hello
world`
      )
    ).toEqual(['hello\n', 'world'])
  })
})
