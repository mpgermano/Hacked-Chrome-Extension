$(function(){
  $('#settingsLink').click(function(){
    var settingsURL = 'chrome-extension://' + chrome.runtime.id + '/html/options.html';
    chrome.tabs.create({url: settingsURL});
  });
});
