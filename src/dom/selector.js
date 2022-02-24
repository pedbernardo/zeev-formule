import {
  FORM_CONTAINER,
  FORM_TABLE_BTN_INSERT,
  FORM_TABLE_CONTAINER,
  FORM_TABLE_MULTI,
  FORM_CTRLS
} from './constants'

export function getFormElements (reference) {
  return {
    container: reference.querySelector(FORM_CONTAINER),
    tableButtons: [...reference.querySelectorAll(FORM_TABLE_BTN_INSERT)]
  }
}

export function getFormTables (container) {
  return {
    tablesContainer: container.querySelectorAll(FORM_TABLE_CONTAINER),
    tablesMulti: container.querySelectorAll(FORM_TABLE_MULTI)
  }
}

export function getFieldHelp (field) {
  return field.nextElementSibling?.tagName === 'EM'
    ? field.nextElementSibling
    : null
}

export function getElementFields (element) {
  return [...element.querySelectorAll(FORM_CTRLS.join(','))]
}
