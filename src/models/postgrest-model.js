var AmpersandModel = require('ampersand-model')
var _ = {result: require('lodash/object/result')}

module.exports = AmpersandModel.extend({
  url: function () {
    var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || ''
    if (this.isNew()) return base

    if (base.charAt(base.length - 1) === '/') {
      base = base.substr(0, -1) // remove trailing slash
    }
    return base + '?' + this.idAttribute + '=eq.' + encodeURIComponent(this.getId())
  }
})
