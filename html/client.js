const socket = io('http://' + window.document.location.host);
const list = document.getElementById("message");


let current = ""


// Event listener for receiving messages from the server
socket.on('chat message', function(msg) {
    receivemsg(msg); // Call function to display received message
});

socket.on('remove', function(msg) {
    remove(msg); // Call function to display disconnected user
});

socket.on('group', function(msg) {
    groupReceivemsg(msg); // Call function to display group received message
});


socket.on('status', function(msg) {
        displayStatus(msg); // Call function to display status
});



/**
 * Uses a regular expression to check if a username is valid.
 * 
 * @param {string} username The username to validate.
 * @returns {boolean} True if the username is valid, otherwise false.
 */
function isValidUsername(username) {
    var regex = /^[a-zA-Z][a-zA-Z0-9]*$/; // Regular expression for checking if the username is valid.
    return regex.test(username);
}

/**
 *  Displays a message indicating that a user has disconnected.
 * 
 * @param {string} username The username of the disconnected user.
 */
function remove(msg)
{
    console.log(msg)
    const receivedMsg = `<li class="state">${msg} has disconnected</li>`;
    list.innerHTML += receivedMsg;
}


/**
 * Displays a status message indicating user connection or disconnection.
 * 
 * @param {string} msg The message to be displayed. Should indicate the username or a generic message.
 */
function displayStatus(msg) {
    let message;
    if (msg !== " A message ") {
        message = `<li class="state">${msg} is now connected</li>`;
    } else {
        message = `<li class="state">A user is now disconnected</li>`;
    }
    list.innerHTML += message;
}


/**
 * sends a message to the server using sockets(other users).
 * 
 */
function sendMessage() {
    const messageInput = document.getElementById('text');
    const message = messageInput.value
        if (!priCheck(message) && current !== "") // check if message has private or group recipient
        {
            socket.emit('chat message', message); // emit to the "chat message" socket function in the server to send to every connected user
            sendmsg(message); // call display sent message function using general format
        }

        else 
        {
            let rep = priCheck(message) // get recipient(s)
            const part = message.split(':'); // get message without recipient info
            const msgOBJ = { recipient : rep,  msg: part[1] } // message object 
            
            socket.emit('Group', msgOBJ); // emit to the "  Group" server socket function to send to the recipient
            sendmsg(part[1] , "red"); // display message on client in group/private format
        }

     // Call function to display sent message
    messageInput.value = '';
}


/**
 * Displays a received message.
 * 
 * @param {string} msg The message to be displayed.
 */
function receivemsg(msg) {
    const receivedMsg = `<li class="message">${msg}</li>`;
    list.innerHTML += receivedMsg;
}

/**
 * Displays a group received message.
 * 
 * @param {string} msg The message to be displayed.
 */
function groupReceivemsg(msg ) {
    const receivedMsg = `<li class="red">${msg}</li>`;
    list.innerHTML += receivedMsg;

}

/**
 * Displays a sent message in the UI.
 * 
 * @param {string} msg The message to be displayed.
 * @param {string} [type=""] The type of message. Optional. Defaults to an empty string which is a normal messsage , else it is a group or private.
 */
function sendmsg(msg, type = "") {
    if (!type && current) {
        const sentMsg = `<li class="message-sent">${current}: ${msg}</li>`;
        list.innerHTML += sentMsg;
    } else if (current) {
        const sentMsg = `<li class="red message-sent">${current}: ${msg}</li>`;
        list.innerHTML += sentMsg;
    }
}


function clear()
{
    list.innerHTML = '';
}

/**
 * Checks a message for words before a colon (:) and returns them as an array.
 * 
 * @param {string} msg The message to be checked.
 * @returns { string[] | string}  An array containing words before the colon (:) in the message.
 */
function priCheck(msg)
{
    const regex = /^(.*?):/; // Regular expression to match word(s) before colon (:)
	const match = msg.match(regex);
	
	if (match) {
	    const wordsBeforeColon = match[1].trim(); // Extract the matched word(s) and trim any leading/trailing spaces
	    const wordArray = wordsBeforeColon.split(','); // Split the matched string by whitespace to get individual words
        return wordArray;
	} 

    return "";
}

/**
 * Handle connection to the chat socket
 */
function handleConnection() 
{
    var usernameInput = document.getElementById('Connect');
    var username = usernameInput.value.trim();
    if (username !== '' && isValidUsername(username)) {
        current = username;
        socket.emit('connecting', current);
        alert("A Connection was Established");
        socket.emit('status', current);
        let status = document.getElementById('status');
        status.innerText = `${current} is now connected`;
        console.log('Connecting with username: ' + username);
    } else if (username == '') {
        alert("Username cannot be empty, connection was not established");
    } else {
        alert("Username is not valid, connection was not established");
    }
    usernameInput.value = '';
}
  

/**
 * Handle disconnection from the chat socket
 */
  function handleDisconnect()
{
    var usernameInput = document.getElementById('Connect');
    var username = usernameInput.value.trim();
  
    let status = document.getElementById('status')
  
    if (status.innerText !== "You are not connected")
    {
      status.innerText = 'You are not connected'
      console.log('disConnecting username: ' + username);
      const name = current
      current = ""
      alert(` ${name} has disconnected`)
  
      socket.emit('remove' , name);
    }
  
    else
    {
      alert("You were not Connected, so can not disconnect")
    }
}