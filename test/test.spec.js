const request = require('supertest');
const sinon = require('sinon');
const chai = require('chai');
const app = require('../app'); // 換成你的 Express 應用的路徑

const expect = chai.expect;

describe('GET /', function () {
  it('should respond with hello world', function (done) {
    request(app)
      .get('/')
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.equal('Hello World!omg');
        done();
      });
  });
});
