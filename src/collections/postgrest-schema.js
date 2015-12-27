var AmpersandRestCollection = require('ampersand-rest-collection')
var PostgRESTColumn = require('../models/postgrest-column')

module.exports = AmpersandRestCollection.extend({
  model: PostgRESTColumn,
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
