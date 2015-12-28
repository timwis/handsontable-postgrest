var request = require('then-request')
var Promise = require('promise')
var Handsontable = require('handsontable')
var _ = { pluck: require('lodash/collection/pluck') }

var container = document.querySelector('#grid')
var baseUrl = 'http://postgrest.herokuapp.com'
var table = 'speakers'

// Get schema
Promise.all([
  request('OPTIONS', baseUrl + '/' + table),
  request('GET', baseUrl + '/' + table)
])
.then(function (responses) {
  var schema = JSON.parse(responses[0].getBody())
  var rows = JSON.parse(responses[1].getBody())
  var primaryKey = schema.pkey[0]
  var headers = _.pluck(schema.columns, 'name')
  var columns = headers.map(function (header) {
    return {
      data: header,
      readOnly: header === primaryKey
    }
  })

  Handsontable(container, {
    data: rows,
    columns: columns,
    colHeaders: headers,
    contextMenu: true,
    minSpareRows: 1,
    afterChange: function (changes, source) {
      if (['edit', 'empty', 'autofill', 'paste'].indexOf(source) !== -1) {
        changes.forEach(function (change) {
          var rowIndex = change[0]
          var identifier = this.getDataAtRowProp(rowIndex, primaryKey)
          var property = change[1]
          var newValue = change[3]

          var changes = {}
          changes[property] = newValue

          if (identifier) {
            var qs = {}
            qs[primaryKey] = 'eq.' + identifier

            request('PATCH', baseUrl + '/' + table, {
              qs: qs,
              json: changes
            })
          } else {
            var context = this
            request('POST', baseUrl + '/' + table, {
              json: changes
            })
            .then(function (createRecordResponse) {
              request('GET', baseUrl + createRecordResponse.headers.location)
              .then(function (getNewRecordResponse) {
                var newData = JSON.parse(getNewRecordResponse.getBody())[0]
                for (var key in newData) {
                  context.setDataAtRowProp(rowIndex, key, newData[key], 'loadData')
                }
              })
            })
          }
        }, this)
      }
    },
    beforeRemoveRow: function (index, amount, logicRows) {
      console.log('removing', logicRows)
      logicRows.forEach(function (row) {
        var identifier = this.getDataAtRowProp(row, primaryKey)

        var qs = {}
        qs[primaryKey] = 'eq.' + identifier
        request('DELETE', baseUrl + '/' + table, {
          qs: qs
        })
      }, this)
    }
  })
})
