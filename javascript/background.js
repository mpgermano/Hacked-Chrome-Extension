/* TODO:

More robust Email validations

Multiple Breached Data Sources
Popup windows for both breached and unbreached (instead of alerts)

Icon Creation

*/

function onInstalled(){
  chrome.browserAction.setPopup({popup: 'html/install.html' });
  alarmInfo = {"when": Date.now() + 0.1, "periodInMinutes": 10.00 };
  chrome.alarms.create("dailyTimer", alarmInfo);
}

function getBreachStatus(){
  var emails = [];
  var i = 0;
  var breachedData = {};

  extractEmails(function(emails) {
    var len = emails.length;

    // Set popup appropriately
    if (len === 0){
      chrome.browserAction.setPopup({popup: 'html/install.html' });
      return;
    }
    else
      chrome.browserAction.setPopup({popup: 'html/loading.html' });

    function makeAJAXCall(email, callback){
      var serviceURL = 'https://haveibeenpwned.com/api/v2/breachedaccount/' + email;
      var startDate = new Date();
      var startMs = startDate.getSeconds();

      $.ajax({
        type: 'GET',
        async: true,
        url: serviceURL,
        complete: function(data){

            var endDate = new Date();
            var endMs = endDate.getMilliseconds();
            var req_time = endMs - startMs;
            var wait_time = 1600 - req_time;
            i++;

            if (data.status === 200)
              breachedData[email] = data.responseJSON;

            if (data.status === 200 || data.status === 404){

              // The API suggests 1600 ms delay between requests to avoid response code 429
              if (i < len){
                setTimeout(function(email, callback) {
                  makeAJAXCall(email, callback);
                }, 1600, emails[i], callback);
              }

            else
              callback(breachedData);
          }
          else
            alert(data.status);

        }
      });
    }

    makeAJAXCall(emails[i], function(breachedData) {
    var popupPage = chrome.extension.getViews({type: 'popup'});

      // If no breach display safePopup.html
      if (jQuery.isEmptyObject(breachedData)){

        if (popupPage[0] != undefined)
          popupPage[0].document.getElementById('safe').click();

        chrome.browserAction.setPopup({ popup: 'html/safePopup.html' });
      }

      // Otherwise display breached popup
      else{

        if (popupPage[0] != undefined)
          popupPage[0].document.getElementById('breach').click();

        chrome.browserAction.setPopup({ popup: 'html/breachedPopup.html' });

        //Store the breached data to be displayed
        chrome.storage.sync.set({breachedData}, function() {
          setTimeout(function() {
          status.textContent = '';
          }, 750);
       });


      }
    });
  });
}

function extractEmails(callback){

  var emails = [];
  chrome.storage.sync.get('emails', function(items){
    try{
      var index = 0;
      for (var account in items.emails) {
        var pageId = 'email' + index;

        // If email exists add to array
        if (items.emails[account] !== undefined){
          emails.push(items.emails[account]);
          index++;
        }
      }
      return callback(emails);
    }
    catch (e){
       ;
    }
  });
}



chrome.runtime.onInstalled.addListener(onInstalled);
chrome.alarms.onAlarm.addListener(getBreachStatus);
chrome.runtime.onMessage.addListener(function (msg, sender, sendRes){
  if (msg == 'accountUpdate'){
    getBreachStatus();
  }
});
