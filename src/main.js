var request = require('then-request')
var Promise = require('promise')
var Handsontable = require('handsontable')
var NProgress = require('nprogress')
;require('nprogress/nprogress.css')
;require('./styles/main.css')
var _ = {
  pluck: require('lodash/collection/pluck'),
  groupBy: require('lodash/collection/groupBy')
}

var container = document.querySelector('#grid')
var baseUrl = 'http://phlcrud.herokuapp.com'
var table = 'candidates'

// Get schema and rows
NProgress.start()
Promise.all([
  request('OPTIONS', baseUrl + '/' + table),
  request('GET', baseUrl + '/' + table)
])
.then(function (responses) {
  NProgress.done()
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
    undo: true,
    columnSorting: true,
    sortIndicator: true,
    persistentState: true,
    afterChange: function (changes, source) {
      var context = this
      // Only listen to changes from certain sources
      if (['edit', 'empty', 'autofill', 'paste', 'undo', 'redo'].indexOf(source) === -1) {
        return
      }
      // Group changes by row and construct a hash of each row's changes
      var changesByRow = {}
      changes.forEach(function (change) {
        var rowIndex = change[0]
        var property = change[1]
        var newValue = change[3]

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
