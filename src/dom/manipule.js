import { isElementEmpty } from './utils.js'

export function moveElementUp (element, stopAt, startElement) {
  const parent = startElement === undefined
    ? element
    : startElement.parentElement

  if (!parent) return

  const parentTag = parent.tagName.toLocaleLowerCase()

  parentTag === stopAt
    ? startElement.insertAdjacentElement('afterend', element)
    : moveElementUp(element, stopAt, parent)
}

export function replaceTag (element, newTag) {
  const html = element.outerHTML
  const currentTag = element.tagName
  const startTagRegex = new RegExp(`^<${currentTag}`, 'i')
  const endTagRegex = new RegExp(`</${currentTag}>$`, 'i')

  element.outerHTML = html
    .replace(startTagRegex, `<${newTag}`)
    .replace(endTagRegex, `</${newTag}>`)

  return element
}

export function cleanTableAttributes (table) {
  table.classList.remove('form-custom')
  table.removeAttribute('border')
  table.removeAttribute('cellpadding')
  table.removeAttribute('cellspacing')
  table.removeAttribute('style')
}

export function removeEmptyElements (container) {
  [...container.querySelectorAll('p, em')]
    .filter(isElementEmpty)
    .forEach(element => {
      element.removeAttribute('style')

      if (!element.hasAttributes()) element.remove()
    })
}
