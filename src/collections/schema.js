var AmpersandRestCollection = require('ampersand-rest-collection')
var Column = require('../models/column')

module.exports = AmpersandRestCollection.extend({
  model: Column,
  initialize: function (models, options) {
    options = options || {}
    this.table = options.table || ''
  },
  url: function () {
    return 'http://phlcrud.herokuapp.com/' + this.table
  },
  parse: function (response, options) {
    if (response.pkey && response.pkey.length) {
      this.primaryKey = response.pkey[0]
    }
    return response.columns || []
  },
  ajaxConfig: {
    type: 'OPTIONS'
  }
})
