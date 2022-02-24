(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Formule = {}));
})(this, (function (exports) { 'use strict';

  const FORM_CONTAINER = '#BoxFrmExecute';
  const FORM_TABLE_BTN_INSERT = '#BtnInsertNewRow';
  const FORM_TABLE_CONTAINER = 'table[mult=N]';
  const FORM_TABLE_MULTI = 'table[mult=S]';

  const FORM_CTRLS = [
    'input[xname][type=text]',
    'input[xname][type=hidden]',
    'textarea[xname]',
    'select[xname]',
    'label.checkbox[for^=inp]',
    'label.radio[for^=inp]',
    'button[id^=btnUpload]',
    'div[xid]'
  ];

  function getFormElements (reference) {
    return {
      container: reference.querySelector(FORM_CONTAINER),
      tableButtons: [...reference.querySelectorAll(FORM_TABLE_BTN_INSERT)]
    }
  }

  function getFormTables (container) {
    return {
      tablesContainer: container.querySelectorAll(FORM_TABLE_CONTAINER),
      tablesMulti: container.querySelectorAll(FORM_TABLE_MULTI)
    }
  }

  function getFieldHelp (field) {
    return field.nextElementSibling?.tagName === 'EM'
      ? field.nextElementSibling
      : null
  }

  function getElementFields (element) {
    return [...element.querySelectorAll(FORM_CTRLS.join(','))]
  }

  function isElementLabel (element) {
    return element.tagName === 'P' && !element.childElementCount && !!element.textContent
  }

  function isElementField (element) {
    element.hasAttribute('xname') || element.hasAttribute('xid');
  }

  function isElementRadio (element) {
    return element.tagName === 'LABEL' && element.classList.contains('radio')
  }

  function isElementCheckbox (element) {
    return element.tagName === 'LABEL' && element.classList.contains('checkbox')
  }

  function isElementEmpty (element) {
    return !element.children.length && !element.textContent.trim()
  }

  function moveElementUp (element, stopAt, startElement) {
    const parent = startElement === undefined
      ? element
      : startElement.parentElement;

    if (!parent) return

    const parentTag = parent.tagName.toLocaleLowerCase();

    parentTag === stopAt
      ? startElement.insertAdjacentElement('afterend', element)
      : moveElementUp(element, stopAt, parent);
  }

  function replaceTag (element, newTag) {
    const html = element.outerHTML;
    const currentTag = element.tagName;
    const startTagRegex = new RegExp(`^<${currentTag}`, 'i');
    const endTagRegex = new RegExp(`</${currentTag}>$`, 'i');

    element.outerHTML = html
      .replace(startTagRegex, `<${newTag}`)
      .replace(endTagRegex, `</${newTag}>`);

    return element
  }

  function cleanTableAttributes (table) {
    table.classList.remove('form-custom');
    table.removeAttribute('border');
    table.removeAttribute('cellpadding');
    table.removeAttribute('cellspacing');
    table.removeAttribute('style');
  }

  function removeEmptyElements (container) {
    [...container.querySelectorAll('p, em')]
      .filter(isElementEmpty)
      .forEach(element => {
        element.removeAttribute('style');

        if (!element.hasAttributes()) element.remove();
      });
  }

  /**
   * Rebuild Orquestra form container DOM elements to use grid instead tables
   * @param {HTMLElement} reference DOM starting point
   * @returns {Object} tables transformed
   */
  function rebuild (reference = document) {
    const { container } = getFormElements(reference);

    if (!container) return

    const { tablesContainer, tablesMulti } = getFormTables(container);

    tablesContainer.forEach(startContainer);

    return { tablesContainer, tablesMulti }
  }

  /**
   * Convert container tables (mult=N) into grid
   * @param {HTMLElement} table - container table
   */
  function startContainer (table) {
    const cells = table.querySelectorAll('td');
    const rows = table.querySelectorAll('tr');
    const caption = table.querySelector('caption');
    const tbody = table.querySelector('tbody');

    cells.forEach(createElements);
    cells.forEach(createColumn);
    rows.forEach(createRow);

    createCollapseHeader(caption);
    createCollapseBody(tbody);
    createCollapse(table);
  }

  function createElements (td) {
    const elements = [...td.children];

    elements.forEach(element => createFieldMember(element, td));

    removeEmptyElements(td);
  }

  function createFieldMember (element, cell) {
    const isLabel = isElementLabel(element);
    const isField = isElementField(element);
    const isCheckbox = isElementCheckbox(element);
    const isRadio = isElementRadio(element);

    if (isLabel) return createFieldLabel(element)

    if (isField) return handleFieldHelp({ field: element })

    if (isCheckbox || isRadio) {
      const fieldId = element.querySelector('[xname]').getAttribute('xname');
      const firstField = cell.querySelector(`[for^=${fieldId}]`);

      return handleFieldHelp({
        field: element,
        fieldReference: firstField
      })
    }

    getElementFields(element)
      .forEach(moveFieldCtrl);
  }

  /**
   * Convert a form label, enclosed with <p> tags by Orquestra
   * into a label (.o-form-label)
   * @param {HTMLElement} label - <p>{Label.someField}</p>
   */
  function createFieldLabel (label) {
    label.classList.add('o-form-label');

    // remove unwanted styles placed by Orquestra editor,
    // for example, when copy & paste inside the editor
    // wired properties can pop into the <p> tag
    label.removeAttribute('style');

    replaceTag(label, 'label');
  }

  /**
   * Replaces Orquestra help text when exists, otherwise removes
   * the empty <em> tag placed next to the field
   *
   * For collection fields (radios e checkboxes) the help text
   * must be moved to the first field in the collection
   *
   * @param {HTMLElement} prop.field - form field
   * @param {HTMLElement} prop.fieldReference - form field reference to move help element
   * @param {HTMLElement} prop.fieldHelp - form field help element
   */
  function handleFieldHelp ({ field, fieldReference, fieldHelp }) {
    fieldHelp = fieldHelp || getFieldHelp(field);
    fieldReference = fieldReference || field;

    if (!fieldHelp?.textContent) return fieldHelp.remove()

    if (fieldHelp) {
      fieldReference.insertAdjacentElement('beforebegin', fieldHelp);
      createFieldHelp(fieldHelp);
    }
  }

  /**
   * Convert field help text <em>'s into <p> (.o-form-label-help)
   * @param {HTMLElement} fieldHelp - form field help element
   */
  function createFieldHelp (fieldHelp) {
    fieldHelp.classList.add('o-form-label-help');
    replaceTag(fieldHelp, 'p');
  }

  /**
   * Convert table row into grid row (.o-columns)
   * @param {HTMLElement} tr - table row
   */
  function createRow (tr) {
    const isEmpty = isElementEmpty(tr);

    if (isEmpty) {
      tr.remove();
      return
    }

    tr.classList.add('o-columns');
    replaceTag(tr, 'div');
  }

  /**
   * Remove unwanted nested elements, moving the form
   * field to the grid cell root level
   *
   * Also handles the field help text to be moved with
   * the form field
   *
   * @param {HTMLElement} field - form field
   */
  function moveFieldCtrl (field) {
    const fieldHelp = getFieldHelp(field);

    moveElementUp(field, 'td');

    // only move the help text after having moved the field itself
    if (fieldHelp) handleFieldHelp({ field, fieldHelp });
  }

  /**
   * Convert table cell <td> into grid cell (.o-column)
   * @param {HTMLElement} td - table cell
   */
  function createColumn (td) {
    td.removeAttribute('colspan');
    td.classList.add('o-column');
    replaceTag(td, 'div');
  }

  /**
   * Convert table caption text into Collapse Header
   * @param {HTMLElement} caption - table caption
   */
  function createCollapseHeader (caption) {
    const title = caption.textContent.trim();

    caption.outerHTML = `
  <header class="o-collapse-header">
    <strong>${title}</strong>
  </header>
  `.trim();
  }

  /**
   * Convert table tbody text into Collapse Header
   * @param {HTMLElement} tbody - table tbody
   */
  function createCollapseBody (tbody) {
    tbody.classList.add('o-collapse-body');
    replaceTag(tbody, 'div');
  }

  /**
   * Convert table caption text into Collapse Header
   * @param {HTMLElement} table - container table
   */
  function createCollapse (table) {
    table.classList.add('o-collapse-item', '-active', 'o-form-collapse');
    cleanTableAttributes(table);
    replaceTag(table, 'div');
  }

  /**
   * @todo
   * Rebuild date form fields and attach native change events
   * Use mutation observer on search fields (sugestão) fields to fire native change events
   * Attach custom events into multivalue tables
   * Create life-cycle form events
   */

  function rewire () {
    console.log('rewire form!');
  }

  exports.rebuild = rebuild;
  exports.rewire = rewire;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
