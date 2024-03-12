document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('send').addEventListener('click', sendMessage);
  document.getElementById('clear').addEventListener('click', clear);
  document.getElementById('text').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') 
      {
        sendMessage();
      }
    })

  document.getElementById('Connect').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
          handleConnection();
      }
      })
  document.getElementById('connectBtn').addEventListener('click', handleConnection);

  document.getElementById('disconnectBtn').addEventListener('click', handleDisconnect);
})


