
function save_options() {
  var email = document.getElementById('email').value;
  chrome.storage.sync.set({
    emailAddress: email,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}


function restore_options() {
  chrome.storage.sync.get({
    emailAddress: null,
  } ,function(items) {
    document.getElementById('email').value = items.emailAddress;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
