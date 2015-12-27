var AmpersandRestCollection = require('ampersand-rest-collection')

module.exports = AmpersandRestCollection.extend({
  initialize: function (models, options) {
    options = options || {}
    this.table = options.table || ''
  },
  url: function () {
    return 'http://phlcrud.herokuapp.com/' + this.table
  }
})
