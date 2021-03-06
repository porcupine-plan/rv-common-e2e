'use strict';
var chai = require('chai');
var assert = chai.assert;
var rvCommonE2E = require('../index.js');

describe('rv-common-e2e', function () {
  it('should have expect defined!', function () {
    assert.isDefined(rvCommonE2E.expect);
  });

  it('should have assert defined!', function () {
    assert.isDefined(rvCommonE2E.assert);
  });

  it('should have helper defined!', function () {
    assert.isDefined(rvCommonE2E.helper);
  });

  it('should have common header page defined!', function () {
    assert.isDefined(rvCommonE2E.commonHeaderPage);
  });

  it('should have google auth page defined!', function () {
    assert.isDefined(rvCommonE2E.googleAuthPage);
  });
});
