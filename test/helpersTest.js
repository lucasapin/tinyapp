const {assert} = require('chai');

const {emailLookup} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup("user@example.com", testUsers);
    const expectedOutput = "user@example.com";
    assert.equal(user.email, expectedOutput);
  });

  it('should return false with invalid email', function() {
    const user = emailLookup("baduser@example.com", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});