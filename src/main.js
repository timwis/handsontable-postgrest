var request = require('then-request')
var Handsontable = require('handsontable')
var NProgress = require('nprogress')
;require('./keyvalselect-editor')
// ;require('./kvselect')
;require('nprogress/nprogress.css')
;require('./styles/main.css')
var _ = {
  pluck: require('lodash/collection/pluck'),
  groupBy: require('lodash/collection/groupBy'),
  findWhere: require('lodash/collection/findWhere')
}

var container = document.querySelector('#grid')
var baseUrl = 'http://phlcrud.herokuapp.com'
var table = 'candidates' // SHOULD NOT BE HARD-CODED

// Get schema and rows
NProgress.start()
request('OPTIONS', baseUrl + '/' + table)
.then(function (schemaResponse) {
  var schema = JSON.parse(schemaResponse.getBody())
  var selectParam = constructSelectParam(schema)
  var primaryKey = schema.pkey[0]
  var headers = _.pluck(schema.columns, 'name')

  var columns = schema.columns.map(function (column) {
    var columnConfig = {
      // data: column.references ? column.name + '.name' : column.name, // SHOULD NOT BE HARD-CODED
      data: column.name,
      readOnly: column.name === primaryKey
    }
    // Editor
    if (column.references) {
      // columnConfig.data = function (dataObject) {
      //   var foreignObject = dataObject[column.name]
      //   return foreignObject ? {
      //     key: foreignObject.id, // HARD-CODED
      //     value: foreignObject.name // HARD-CODED
      //   } : {}
      // }
      // columnConfig.renderer = kvRenderer
      // columnConfig.editor = 'select'
      columnConfig.type = 'keyvalselect'
      // columnConfig.type = 'handsontable'
      // columnConfig.handsontable = {
      //   data: [{id: 1, name: 'President'}, {id: 2, name: 'Mayor'}, {id: 8, name: 'Governor'}]
      // }
      // columnConfig.source = ['President', 'Mayor', 'Governor']
      columnConfig.selectOptions = {1: 'President', 2: 'Mayor', 8: 'Governor'}
      // columnConfig.source = function (query, callback) { // returns promise
      //   return request('GET', baseUrl + '/' + column.references.table)
      //   .then(function (response) {
      //     var rows = JSON.parse(response.getBody())
      //     return rows.reduce(function (hash, item) {
      //       hash[item[column.references.column]] = item.name // SHOULD NOT BE HARD-CODED
      //       return hash
      //     }, {})
      //   })
      // }
    }
    return columnConfig
  })

  request('GET', baseUrl + '/' + table, {
    qs: selectParam ? {select: selectParam} : null
  })
  .then(function (rowsResponse) {
    NProgress.done()
    var rows = JSON.parse(rowsResponse.getBody())

    Handsontable(container, {
      data: rows,
      columns: columns,
      colHeaders: headers,
      contextMenu: true,
      minSpareRows: 1,
      undo: true,
      columnSorting: true,
      sortIndicator: true,
      persistentState: true,
      afterChange: function (changes, source) {
        var context = this
        console.log(changes, source)
        // Only listen to changes from certain sources
        if (['edit', 'empty', 'autofill', 'paste', 'undo', 'redo'].indexOf(source) === -1) {
          return
        }
        // Group changes by row and construct a hash of each row's changes
        var changesByRow = {}
        changes.forEach(function (change) {
          var rowIndex = change[0]
          var property = change[1]
          // var updateProperty = property.split('.')[0] // only get first property in dot-notation string
          var newValue = change[3]

          // If property is a foreign entity, get its primary key
          var column = _.findWhere(schema.columns, {name: property})
          if (column && column.references) {
            newValue = change[3][column.references.column]
          }

          if (!changesByRow[rowIndex]) changesByRow[rowIndex] = {}
          changesByRow[rowIndex][property] = newValue

          // Show loading indicator on cell
          var colIndex = this.propToCol(property)
          this.getCell(rowIndex, colIndex).classList.toggle('syncing', true)
        }, this)

        // Send a request for each row that's changed
        for (var rowIndex in changesByRow) {
          var rowChanges = changesByRow[rowIndex]
          var identifier = this.getDataAtRowProp(rowIndex, primaryKey)

          if (identifier) {
            // If there's an identifier already, edit the record
            var qs = {}
            qs[primaryKey] = 'eq.' + identifier

            setPendingRequests(1)
            request('PATCH', baseUrl + '/' + table, {
              qs: qs,
              json: rowChanges
            })
            .then(function (scopedRowIndex) { // necessary because rowIndex gets changed by the for..in loop
              return function () {
                setPendingRequests(-1)

                // Remove loading indicator from every cell in this row (NodeLists are fun!....)
                var syncingCells = context.getCell(scopedRowIndex, 0).parentNode.querySelectorAll('.syncing')
                for (var i = 0; i < syncingCells.length; i++) {
                  syncingCells[i].classList.toggle('syncing', false)
                }
              }
            }(rowIndex))
          } else {
            // If there's no identifier, create the record
            setPendingRequests(1)
            request('POST', baseUrl + '/' + table, {
              json: rowChanges,
              headers: {Prefer: 'return=representation'}  // return the new record
            })
            .then(function (scopedRowIndex) {
              return function (createRecordResponse) {
                setPendingRequests(-1)

                // Set the data in the table based on the new record's data (ex. auto generated ID)
                var newData = JSON.parse(createRecordResponse.getBody())
                for (var key in newData) {
                  context.setDataAtRowProp(scopedRowIndex, key, newData[key], 'loadData')
                }
              }
            }(rowIndex))
          }
        }
      },
      beforeRemoveRow: function (index, amount, logicRows) {
        for (var rowIndex = index; rowIndex < index + amount; rowIndex++) {
          var identifier = this.getDataAtRowProp(rowIndex, primaryKey)

          var qs = {}
          qs[primaryKey] = 'eq.' + identifier

          setPendingRequests(1)
          request('DELETE', baseUrl + '/' + table, {
            qs: qs
          })
          .then(function () {
            setPendingRequests(-1)
          })
        }
      }
    })
  })
})

var pendingRequests = 0
var setPendingRequests = function (increment) {
  pendingRequests += increment
  if (pendingRequests < 1) {
    window.onbeforeunload = undefined
  } else {
    window.onbeforeunload = function () {
      return "There are changes that haven't been saved yet"
    }
  }
}

var constructSelectParam = function (schema) {
  var foreignEntities = []
  schema.columns.forEach(function (column) {
    if (column.references) foreignEntities.push(column.name + '{*}')
  })
  if (foreignEntities.length) {
    foreignEntities.unshift('*')
    return foreignEntities.join(',')
  } else {
    return ''
  }
}
