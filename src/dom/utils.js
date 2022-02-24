export function isElementLabel (element) {
  return element.tagName === 'P' && !element.childElementCount && !!element.textContent
}

export function isElementField (element) {
  element.hasAttribute('xname') || element.hasAttribute('xid')
}

export function isElementRadio (element) {
  return element.tagName === 'LABEL' && element.classList.contains('radio')
}

export function isElementCheckbox (element) {
  return element.tagName === 'LABEL' && element.classList.contains('checkbox')
}

export function isElementEmpty (element) {
  return !element.children.length && !element.textContent.trim()
}
