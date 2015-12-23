var AmpersandModel = require('ampersand-model')

var typeMap = {
  'integer': 'number',
  'bigint': 'number',
  'int8': 'number',
  'bigserial': 'number',
  'serial8': 'number',
  'bit': 'number',
  'varbit': 'number',
  'boolean': 'boolean',
  'box': 'string',
  'bytea': 'number',
  // http://www.postgresql.org/docs/9.4/static/datatype.html
  'text': 'string'
}

module.exports = AmpersandModel.extend({
  props: {
    references: 'string',
    default: 'string',
    precision: 'number',
    updatable: 'boolean',
    schema: 'string',
    name: 'string',
    type: 'string',
    propType: 'string',
    maxLen: 'number',
    enum: 'array',
    nullable: 'boolean',
    position: 'number'
  },
  idAttribute: 'name',
  parse: function (attrs, options) {
    attrs.propType = typeMap[attrs.type] || 'any'
    return attrs
  }
})
