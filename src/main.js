var PostgRESTModel = require('./models/postgrest-model')
var PostgRESTCollection = require('./collections/postgrest-collection')
var HandsontableMixin = require('./collections/handsontable-mixin')
var Schema = require('./collections/postgrest-schema')
var Grid = require('./views/grid')
var _ = {clone: require('lodash/lang/clone')}

// Mix in missing array methods necessary for handsontable
var GridCollection = PostgRESTCollection.extend(HandsontableMixin)

var schema = new Schema(null, {table: 'candidates'})
schema.fetch({
  success: function (schemaCollection, response, options) {
    // Reduce schemaCollection to a props hash for the Ampersand model
    var props = schemaCollection.reduce(function (result, model) {
      result[model.name] = model.propType
      return result
    }, {})

    // Create a model for this table using the schema obtained
    var GridModel = PostgRESTModel.extend({
      props: props,
      idAttribute: schemaCollection.primaryKey
    })

    // Initialize a collection using our new model
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
  }
})
