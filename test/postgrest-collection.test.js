/* global describe, it */
var PostgRESTCollection = require('../src/collections/postgrest-collection')
require('should')

describe('grid collection', function () {
  var baseUrl = 'http://phlcrud.herokuapp.com'

  it('index url', function () {
    var collection = new PostgRESTCollection(null, {table: 'foo'})
    collection.url().should.eql(baseUrl + '/foo')
  })
})
