/**
 * source: array of strings, array of {label: '', value: ''} objects (both properties optional),
 *  or an object where the keys represent the value attribute and the values represent the label/text
 */
var Handsontable = require('handsontable')
var Promise = require('promise')
var _ = {extend: require('lodash/object/extend')}
;require('./styles/select-editor.css')

var SelectEditor = Handsontable.editors.BaseEditor.prototype.extend()

SelectEditor.prototype.init = function () {
  this.select = document.createElement('select')
  Handsontable.Dom.addClass(this.select, 'select-editor')
  this.select.style.display = 'none'
  this.instance.rootElement.appendChild(this.select)
}

SelectEditor.prototype.prepare = function () {
  Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments) // call parent method

  var source = this.cellProperties.source
  var currentValue = this.instance.getDataAtCell(this.cellProperties.physicalRow, this.cellProperties.physicalCol)
  var optionsPromise

  if (typeof source === 'function') {
    optionsPromise = source(this.row, this.col, this.prop)
  } else {
    optionsPromise = source
  }

  var context = this

  Promise.resolve(optionsPromise).then(function (options) {
    Handsontable.Dom.empty(context.select) // clear select of existing options

    // Convert object to array of objects
    if (typeof options === 'object' && !Array.isArray(options)) {
      var optionsArray = []
      for (var option in options) {
        optionsArray.push({value: option, label: options[option]})
      }
      options = optionsArray
    }
    options.forEach(function (option) {
      var label = option.label || option.value || option
      var value = option.value || option.label || option

      var optionEl = document.createElement('option')
      optionEl.value = value
      Handsontable.Dom.fastInnerHTML(optionEl, label)
      this.select.appendChild(optionEl)
    }, context)

    if (currentValue) {
      // context.select.value = currentValue.id
      // console.log(currentValue, context.select.value)
    }
  })
}

SelectEditor.prototype.getValue = function () {
  return {
    id: this.select.value,
    jurisdiction: null,
    name: this.select.options[this.select.selectedIndex].text
  }
}

SelectEditor.prototype.setValue = function (value) {
  this.select.value = value.id
}

SelectEditor.prototype.beginEditing = function (initialValue, event) {
  var newValue = typeof initialValue === 'string' ? initialValue : this.originalValue
  Handsontable.editors.BaseEditor.prototype.beginEditing.apply(this, arguments) // call parent method
  this.setValue(newValue) // technically this is the second time it's called, since parent calls it
}

// SelectEditor.prototype.saveValue = function () {
//   console.log('saving', arguments)
// }

SelectEditor.prototype.open = function () {
  var width = Handsontable.Dom.outerWidth(this.TD)
  var height = Handsontable.Dom.outerHeight(this.TD)
  var rootOffset = Handsontable.Dom.offset(this.instance.rootElement)
  var tdOffset = Handsontable.Dom.offset(this.TD)

  // sets <select> dimensions to match cell size
  this.select.style.height = height + 'px'
  this.select.style.width = width + 'px'

  // make sure that <select> position matches cell position
  this.select.style.top = tdOffset.top - rootOffset.top + 'px'
  this.select.style.left = tdOffset.left - rootOffset.left + 'px'
  this.select.style.margin = '0'

  // display the <select>
  this.select.style.display = ''
}

SelectEditor.prototype.close = function () {
  this.select.style.display = 'none'
}

SelectEditor.prototype.focus = function () {
  this.select.focus()
}

Handsontable.editors.SelectEditor = SelectEditor
Handsontable.editors.registerEditor('select', SelectEditor)
module.exports = SelectEditor
