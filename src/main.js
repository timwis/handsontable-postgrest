var AmpersandModel = require('ampersand-model')
var GridCollection = require('./collections/grid-collection')
var Schema = require('./collections/schema')
var Grid = require('./views/grid')

var schema = new Schema(null, {table: 'candidates'})
schema.fetch({
  success: function (schemaCollection, response, options) {
    var props = schemaCollection.reduce(function (result, model) {
      result[model.name] = model.propType
      return result
    }, {})

    var GridModel = AmpersandModel.extend({
      props: props
    })
    var gridCollection = new GridCollection(null, {
      model: GridModel,
      table: 'candidates'
    })
    gridCollection.fetch({
      success: function (collection, response, options) {
        var container = document.querySelector('#grid')
        new Grid(container, schemaCollection, collection) // eslint-disable-line
      }
    })

    gridCollection.on('change', function (model) {
      console.log('changed', model)
    })
  }
})
