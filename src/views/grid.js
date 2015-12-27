var Handsontable = require('handsontable')

// Helper function to get/set ampersand model properties. Unfortunately
// necessary because ampersand models don't expose their members like and object
function columns (schema) {
  return schema.map(function (column) {
    return {
      data: function (row, val) {
        if (val !== undefined) {
          row[column.name] = val
        }
        return row[column.name]
      },
      readOnly: column.name === schema.primaryKey
    }
  })
}

module.exports = function (container, schema, data) {
  return Handsontable(container, {
    data: data,
    columns: columns(schema),
    contextMenu: true,
    colHeaders: schema.pluck('name'),
    rowHeaders: true,
    minSpareCols: 1,
    minSpareRows: 1,
    columnSorting: true,
    observeChanges: false, // fix handsontable backbone issue https://github.com/handsontable/handsontable/issues/2609
    sortIndicator: true,
    manualColumnResize: true,
    manualColumnMove: true,
    manualRowMove: true,
    fillHandle: false, // seems to crash postgres when enabled
    persistentState: true
  })
}
