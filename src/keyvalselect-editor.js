var Handsontable = require('handsontable')

var KeyValSelectEditor = Handsontable.editors.SelectEditor.prototype.extend()

KeyValSelectEditor.prototype.beginEditing = function (initialValue, event) {
  var newValue = typeof initialValue === 'string' ? initialValue : this.originalValue
  Handsontable.editors.SelectEditor.prototype.beginEditing.apply(this, arguments) // call parent method
  this.setValue(newValue) // technically this is the second time it's called, since parent calls it (with stringify)
}

KeyValSelectEditor.prototype.getValue = function () {
  return { // doesn't work when originalValue is empty
    id: this.select.value,
    jurisdiction: null,
    name: this.select.options[this.select.selectedIndex].text
  }
}

KeyValSelectEditor.prototype.setValue = function (value) {
  this.select.value = value && value.id ? value.id : ''
}

var KeyValSelectRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  if (value && value.name) Handsontable.Dom.fastInnerHTML(td, value.name)
  return td
}

Handsontable.editors.KeyValSelectEditor = KeyValSelectEditor
Handsontable.editors.registerEditor('keyvalselect', KeyValSelectEditor)
Handsontable.renderers.KeyValSelectRenderer = KeyValSelectRenderer
Handsontable.KeyValSelectCell = {
  editor: Handsontable.editors.KeyValSelectEditor,
  renderer: Handsontable.renderers.KeyValSelectRenderer
}
Handsontable.cellTypes.keyvalselect = Handsontable.KeyValSelectCell
