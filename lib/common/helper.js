/*globals browser, protractor */
'use strict';

const writeStream = require("fs").createWriteStream;
const execSync = cmd => require("child_process").execSync(cmd, {encoding: "utf8"});

var globalTimeout = 30000;
var EC = protractor.ExpectedConditions;

/**
 * Usage: wait(element, label)
 * element : It will wait for this element to come into view
 * label : just used for the error message
 */
var wait = function (element, label, timeout) {
  return browser.wait(function () {
    return element.isPresent().then(function (state) {
      if (state === true) {
        return element.isDisplayed().then(function (state2) {
          if (state2 === true) {
            return element.isEnabled().then(function (state3) {
              return state3 === true;
            });
          }
        });
      } else {
        return false;
      }
    });
  }, (timeout)? timeout : globalTimeout, label + " did not appear");
};
exports.wait = wait;

/**
 * Usage: waitDisappear(element, label)
 * element : It will wait for this element to disappear from view
 * label : just used for the error message
 */
var waitDisappear = function (element, label, timeout) {
  return browser.wait(function () {
    return element.isPresent().then(function (state) {
      if (state === true) {
        return element.isDisplayed().then(function (state) {
          return !state;
        }, function() {
          // Element not found? Assume it disappeared after isPresent call
          return true;
        });
      } else {
        return true;
      }
    }, function (err) {
      console.log("Error when calling isPresent for: " + label, err);
      // Failure when calling isPresent. Assume it has already disappeared
      return true;
    });
  }, (timeout)? timeout : globalTimeout, label + " did not disappear");
};

exports.waitDisappear = waitDisappear;

/**
 * Usage: waitRemoved(element, label)
 * element : It will wait for this element to be removed from view
 * label : just used for the error message
 */
var waitRemoved = function (element, label, timeout) {
  return browser.wait(function () {
    return element.isPresent().then(function (state) {
      return !state;
    });
  }, (timeout)? timeout : globalTimeout, label + " did not disappear");
};

exports.waitRemoved = waitRemoved;

/**
 * Usage: waitForElementTextToChange(element, textToWaitFor)
 * element : It will wait for this element text to change
 * textToWaitFor : text to wait for
 * label : just used for the error message
 */
var waitForElementTextToChange = function (element, textToWaitFor, label, timeout) {
  return browser.wait(EC.textToBePresentInElement(element, textToWaitFor), 
    (timeout)? timeout : globalTimeout, 
    label + " text did not change");
};

exports.waitForElementTextToChange = waitForElementTextToChange;

/**
 * Usage: waitForAlert(label)
 * label : just used for the error message
 */
var waitForAlert = function (label, timeout) {
  return browser.wait(EC.alertIsPresent(), 
    (timeout)? timeout : globalTimeout, 
    label + " alert did not appear")
  .then(function () {
    return browser.switchTo().alert();
  });
};

exports.waitForAlert = waitForAlert;

/**
 * Usage: waitForUrlToContain(textToSearchFor)
 * textToSearchFor : the string to search for in the URL
 */
var waitForUrlToContain = function (textToSearchFor, timeout) {
  return browser.wait(EC.urlContains(textToSearchFor), 
    (timeout)? timeout : globalTimeout, 
    "URL did not contain " + textToSearchFor);
};

exports.waitForUrlToContain = waitForUrlToContain;

/**
 * Usage: clickWhenClickable(element, label)
 * element : It will click on the element when it is clickable
 * label : just used for the error message
 */
var clickWhenClickable = function (element, label, timeout) {
  return browser.wait(function () {
    return EC.elementToBeClickable(element);
  }, (timeout)? timeout : globalTimeout, label + " not clickable")
  .then(function() {
    return element.click();
  });
};

exports.clickWhenClickable = clickWhenClickable;

/**
 * Usage: clickOverIFrame(element)
 * element : It will click on the element; must be wider/taller than 5 pixels
 */
var clickOverIFrame = function (element) {
  // use direct JS command (https://github.com/SeleniumHQ/selenium/issues/4075#issuecomment-456137895)
  try {
    browser.executeScript('arguments[0].click();', element);
  } catch (exception) {
    throw exception;
  }
};

exports.clickOverIFrame = clickOverIFrame;

/**
 * Usage: waitForSpinner()
 * Will wait for any active spinner to disappear
 * timeout: optional value in MS
 */
var waitForSpinner = function (timeout) {
  return waitDisappear(browser.element(".spinner-backdrop.in"), "Spinner element did not disappear", timeout);
};

exports.waitForSpinner = waitForSpinner;

/**
 * Usage: takeScreenshot(fileName)
 * fileName : The file name to save
 */
var takeScreenshot = function (fileName, timeout) {
  return browser.wait(function () {
    return new Promise((res)=>{
      browser.takeScreenshot()
      .then((png)=>{
        writeStream(fileName || "shot.png")
        .end(png, "base64", ()=>res(true));
      });
    });
  }, (timeout)? timeout : 2000, "screenshot error");
};

exports.takeScreenshot = takeScreenshot;

var waitForScreenImage = function (compareFile, timeout) {
  timeout = timeout || 9000;
  return browser.wait(new Promise(compareScreens), timeout, "screenshot timeout");

  function compareScreens(res) {
    browser.takeScreenshot()
    .then((png)=>{
      let shotPath = execSync("mktemp").replace("\n","");
      let diffPath = execSync("mktemp").replace("\n","");
      writeStream(shotPath).end(png, "base64", ()=>{
        let compareCmd = `compare -metric MSE ${shotPath} ${compareFile} ${diffPath} 2>&1` +
                        `|| true`;
        let compareResult = execSync(compareCmd);
        console.log(compareResult);
        if (parseInt(compareResult, 10) < 200) {return res(true);}
        setTimeout(()=>{compareScreens(res);}, 1000);
      });
    });
  }
};

exports.waitForScreenImage = waitForScreenImage;

/**
 * Usage: Handle google sign in.  Expects signin process to be initiated (eg: signin button has been clicked)
 * email: user email to use for sign in
 * pass: user pass to use for sign in
 * additionalChallengeCityAnswer: answer for the "What city do you normally sign in from" challenge
 */
var googleSignIn = function (email, pass, additionalChallengeCityAnswer) {
  let mainWindow = browser.windowHandles().value[0];
  let enter = "\ue007";

  browser.waitUntil(()=>browser.windowHandles().value.length === 2, 10000, "login window not present");
  browser.window(browser.windowHandles().value[1]);

  browser.waitForExist("#identifierId");
  browser.element("#identifierId").setValue(email);
  browser.element("#identifierNext").click();

  browser.waitForVisible("#password input");
  browser.element("#password input").setValue(pass);
  browser.element("#passwordNext").click();

  // This had to be added here so it can wait for the pop up window to close
  browser.pause(5000);

  browser.waitUntil(()=>{
    if (browser.windowHandles().value.length === 1) {return true;}

  if (browser.element("#headingText").getText() === "Verify it's you") {
    browser.element("div=Enter the city you usually sign in from").click();
    browser.waitForVisible("#challengePickerList");
    browser.element("span=Enter the city you usually sign in from").click();
    browser.waitForVisible("#challenge");
    browser.element("#answer").setValue(additionalChallengeCityAnswer);
    browser.keys(enter);

    // This had to be added here so it can wait for the pop up window to close
    browser.pause(5000);
  }

}, 15000, "could not complete signin process");

browser.window(mainWindow);
};

exports.googleSignIn = googleSignIn;
