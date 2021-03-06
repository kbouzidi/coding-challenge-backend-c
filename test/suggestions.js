'use strict';

require('dotenv').config();
const expect = require('chai').expect;
const app = require('../app');
const request = require('supertest')(app);
const Geonames = require('../src/models/geonames');
const Charmap = require('charmap');
// const mongoose = require('mongoose');
const utils = require('../src/libs/utils');

describe('GET /suggestions', function() {
  before(function(done) {
    setTimeout(function() {
      request.get('/ping').expect(200, done);
    }, 6000);
  });

  after(function(done) {
    app.listen().close();
    done();
  });
  describe('Unit Test', function() {
    it('should find some data in the DB', async function() {
      // await mongoose.connection.dropDatabase();
      await utils.populateDB();
      const data = await Geonames.find({country: 'CA'});
      expect(data).to.be.instanceof(Array);
      expect(data).to.have.length.above(0);
    });
  });

  describe('with a non-existent city', function() {
    let response;

    before(function(done) {
      request.get('/suggestions?q=SomeRandomCityInTheMiddleOfNowhere').end(function(err, res) {
        response = res;
        response.json = JSON.parse(res.text);
        done(err);
      });
    });

    it('returns a 404', function() {
      expect(response.statusCode).to.equal(404);
    });

    it('returns an empty array of suggestions', function() {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length(0);
    });
  });

  describe('with a valid city', function() {
    let response;
    before(function(done) {
      request.get('/suggestions?q=Montreal').end(function(err, res) {
        response = res;
        response.json = JSON.parse(res.text);
        done(err);
      });
    });

    it('returns a 200', function() {
      expect(response.statusCode).to.equal(200);
    });

    it('returns an array of suggestions', function() {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length.above(0);
    });

    it('contains a match', function() {
      expect(response.json.suggestions).to.satisfy(function(suggestions) {
        return suggestions.some(function(suggestion) {
          const normalizedName = Charmap.transform(suggestion.name);
          return expect(normalizedName).to.match(/montreal/i);
        });
      });
    });

    it('contains latitudes and longitudes', function() {
      expect(response.json.suggestions).to.satisfy(function(suggestions) {
        return suggestions.every(function(suggestion) {
          return suggestion.latitude && suggestion.longitude;
        });
      });
    });

    it('contains scores', function() {
      expect(response.json.suggestions).to.satisfy(function(suggestions) {
        return suggestions.every(function(suggestion) {
          return suggestion.latitude && suggestion.longitude;
        });
      });
    });
  });
  describe('with a valid Longitude and Latitude', function(done) {
    let response;
    before(function(done) {
      request.get('/suggestions?q=Lond&latitude=43.70011&longitude=-79.4163').end(function(err, res) {
        response = res;
        response.json = JSON.parse(res.text);
        done(err);
      });
    });

    it('returns a 200', function() {
      expect(response.statusCode).to.equal(200);
    });

    it('returns an array of suggestions', function() {
      expect(response.json.suggestions).to.be.instanceof(Array);
      expect(response.json.suggestions).to.have.length.above(0);
    });

    it('contains a match', function() {
      expect(response.json.suggestions).to.satisfy(function(suggestions) {
        return suggestions.some(function(suggestion) {
          const normalizedName = Charmap.transform(suggestion.name);
          return expect(normalizedName).to.match(/london/i);
        });
      });
    });

    it('contains latitudes and longitudes', function() {
      expect(response.json.suggestions).to.satisfy(function(suggestions) {
        return suggestions.every(function(suggestion) {
          return suggestion.latitude && suggestion.longitude;
        });
      });
    });

    it('contains scores', function() {
      expect(response.json.suggestions).to.satisfy(function(suggestions) {
        return suggestions.every(function(suggestion) {
          return suggestion.latitude && suggestion.longitude;
        });
      });
    });
  });
});
