/*globals element, by, browser*/
'use strict';
var helper = require('../common/helper.js');

var GoogleAuthPageNew = function () {
  var USERNAME = browser.params.login.user;
  var PASSWORD = browser.params.login.pass;
  
  var intialViewPage = element(by.id('initialView'));
  var emailField = element(by.id('identifierId'));
  var identifierNextButton = element(by.id('identifierNext'));

  var passwordField = element(by.css('#password input'));
  var passwordNextButton = element(by.id('passwordNext'));  

  var challengeCard = element(by.cssContainingText('h1', 'Verify it\'s you'));
  var cityChallengeButton = element(by.cssContainingText('li div', 'Enter the city you usually sign in from'));

  this.signin = function (username, password) {
    username = username || USERNAME;
    password = password || PASSWORD;

    return helper.wait(intialViewPage, "Google Sign In Page").then(function () {
      console.log('New Google Sign In Page found');
      helper.wait(emailField, "Google Sign In Email Field").then(function () {
        helper.wait(identifierNextButton, "Google Sign In Next Button").then(function () {
          emailField.sendKeys(username);
          return identifierNextButton.click();
        }).then(function () {
          helper.wait(passwordField, "Google Sign In Password Field").then(function () {
            passwordField.sendKeys(password);
            return passwordNextButton.click();
          });
        }).then(function() {
          console.log('New Google Sign In Completed');
          helper.wait(challengeCard, "Google Verify it's you page").then(function () {
            console.log('New Google Verify it\'s you page found');

            helper.wait(cityChallengeButton, "Enter the city you usually sign in from").then(function () {
              console.log('Enter the city button found');

              return cityChallengeButton.click();
            });
          }, function() {
            return;
          });
        });
      }, function () {
        var accountChooser = element(by.cssContainingText('p', username));
        helper.wait(accountChooser, "Google Account Chooser", 3000).then(function () {
          return accountChooser.click();
        });
      });
    });

  };
};

module.exports = GoogleAuthPageNew;