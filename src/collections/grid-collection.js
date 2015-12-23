var AmpersandRestCollection = require('ampersand-rest-collection')
var _ = require('lodash')

// Shim push, slice, and splice -- handsontable expects these methods
// but ampersand doesn't have them out of the box
module.exports = AmpersandRestCollection.extend({
  initialize: function (models, options) {
    options = options || {}
    this.table = options.table || ''
  },
  url: function () {
    return 'http://phlcrud.herokuapp.com/' + this.table
  },
  // Shim push, slice, and splice for handsontable
  push: function (model, options) {
    return this.add(model, _.extend({at: this.length}, options))
  },
  slice: function () {
    return Array.prototype.slice.apply(this.models, arguments)
  },
  splice: function () {
    console.log('splice', arguments)
    return Array.prototype.splice.apply(this.models, arguments)
  }
})
