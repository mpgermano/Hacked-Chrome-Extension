// TODO: More thorough email verification
function process_form(e) {
  e.preventDefault();
  var error = false;
  var validAccounts = [];
  var badAccounts = [];
  var errorList = $('ul.errorMessages');
  errorList.empty();

  $('#accounts').children('div').children('input').each(function(){
    if (this.id.match('^email')){
      if (this.value !== '' && this.value.indexOf('@') > -1 && this.value.indexOf('.') > -1){
         validAccounts.push(this.value);
      }
      else if (this.value !== ''){
        errorList.append( "<li><span><strong>Error: </strong></span>" + this.value + " is not a valid email address.</li>");
        badAccounts.push(this.value);
        error = true;
      }
    }
  });

  if (validAccounts.length === 0 && badAccounts.length === 0)
  {
    errorList.append("<li><span><strong>Error: </strong></span>No email address was provided.</li>");
    error = true;
  }

  if (!error)
    save_values(validAccounts);
  else
    errorList.show()
}

function save_values(accounts) {

  //First clear any existing values
  chrome.storage.sync.clear();

  var accountNum = 0;
  emails = {}

  for (accountNum; accountNum < accounts.length; accountNum++){
    var storeName = 'account' + accountNum;
    emails[storeName] = accounts[accountNum];
  }
  chrome.storage.sync.set({emails}, function() {
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  
  //Send a message to background.js to check breach status for new/updated emails
  chrome.runtime.sendMessage('accountUpdate');

  closeOptionsTab();
}


function restore_options() {
  chrome.storage.sync.get('emails', function(items){
    try {
      var index = 0;
      for (var account in items.emails) {
        if (index > 0){
          $('#addMore').click();
        }
        var pageId = 'email' + index;

        // If email exists place in the next field
        if (items.emails[account] !== undefined){
          document.getElementById(pageId).value = items.emails[account];
          index++;
        }
      }
     }
     // This is needed for the first time the options page is loaded (after install)
     catch (e){
       ;
     }
  });
}


function closeOptionsTab(){
  chrome.tabs.getCurrent(function(tab) {
    chrome.tabs.remove(tab.id, function() { });
  });
}

// Load More Email Fields
$(function(){
	var maxFields = 5;
	var currentNumFields = 1;
	$('#addMore').click(function(e){
		e.preventDefault();
		if (currentNumFields < maxFields){
			currentNumFields++;
			var num = currentNumFields - 1;
			var emailNum = 'email' + num;
			var newHTML = '<div class="col-sm-7 col-sm-offset-3" style="padding-bottom:10px"><input type="text" class="form-control input-normal" id="' + emailNum + '" /></div>';
			$('#accounts').append(newHTML);
		}
	});
});

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    process_form);
