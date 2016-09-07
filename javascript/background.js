/* TODO:

Warnings about empty emails
Email validations
Multiple Emails

Multiple Breached Data Sources
Popup windows for both breached and unbreached (instead of alerts)

Icon Creation

*/

function onInstalled(){
  chrome.tabs.create({'url': 'chrome://extensions/?options=' + chrome.runtime.id });
  alarmInfo = {"when": Date.now() + 0.1, "periodInMinutes": 10.00 };
  chrome.alarms.create("dailyTimer", alarmInfo);
}


function onAlarm(alarm) {
  getBreachStatus();
}

function getBreachStatus(){
  var email = null;
  chrome.storage.sync.get({
    emailAddress: null,
  } ,function(items) {
    email = items.emailAddress;
    // Make AJAX calls to different breach watching services
    if (email !== null && email !== '')
    	makeAJAXCall(email);
  });
}  

function makeAJAXCall(email){
  serviceURL = 'https://haveibeenpwned.com/api/v2/breachedaccount/' + email;
  $.ajax({
    type: 'GET',
    url: serviceURL,
    success: function(data, textStatus, xhr){
      if (xhr.status == 200){
        chrome.browserAction.setPopup({ popup: 'html/breachedPopup.html' });   
      }
    },
    error: function(xhr, textStatus){
      if (xhr.status == 404){
          chrome.browserAction.setPopup({ popup: 'html/safePopup.html' });
        }
    }
  });
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.alarms.onAlarm.addListener(onAlarm);
