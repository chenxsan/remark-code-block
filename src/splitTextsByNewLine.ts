export function splitTextsByNewLine(text: string) {
  return text.split(/(?<=\r?\n)/)
}
