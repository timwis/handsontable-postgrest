var _ = require('lodash')

// Shim push, slice, and splice -- handsontable expects these methods
// but ampersand doesn't have them out of the box
module.exports = {
  push: function (model, options) {
    return this.add(model, _.extend({at: this.length}, options))
  },
  slice: function () {
    return Array.prototype.slice.apply(this.models, arguments)
  },
  splice: function () {
    return Array.prototype.splice.apply(this.models, arguments)
  }
}
