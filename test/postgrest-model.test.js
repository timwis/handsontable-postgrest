/* global describe, it */
var PostgRESTModel = require('../src/models/postgrest-model')
require('should')

describe('postgrest model', function () {
  var TestModel = PostgRESTModel.extend({
    props: {
      id: 'number',
      name: 'string'
    }
  })

  it('patch request', function () {
    var model = new TestModel({id: 1, name: 'Alfred'})
    model.isNew = function () { return false }

    var request = model.save({name: 'Brad'}, {patch: true})
    request.uri.path.should.eql('?id=eq.1')
    request.method.should.eql('PATCH')
    request.should.have.property('attrs', {name: 'Brad'})  // shouldn't this be request.body ?
  })
})
