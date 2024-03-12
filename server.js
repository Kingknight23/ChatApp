/*
(c) 2022 LD Nel

//collaboration with Socket IO
//=============================

install npm modules:
You must first install npm socket.io module
>npm install socket.io

To run:
>node server.js

To test:
Open several browsers at http://localhost:3000/index.html
*/

//Cntl+C to stop server
const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs") //need to read static files
const { Socket } = require('socket.io')
const url = require("url") //to parse url strings

//OPTONAL: allow PORT to be passed in as command line argument or environment variable
const PORT = process.argv[2] || process.env.PORT || 3000

app.listen(PORT) //start server listening on PORT

const ROOT_DIR = "html"; //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

user = { connected : [] }


io.on('connection', (socket) => {
    console.log('A user connected');


    socket.on('connecting', (msg) => {
      // Push user information into the connected users array
      user.connected.push({ socketId: socket.id, user: msg });
  
      // Log the updated list of connected users
      console.log(user.connected);
  });


  socket.on('chat message', (msg) => 
  {
    // Get the socket ID of the current client
    let SocketID = socket.id;

    // Find the username of the current client
    let name = user.connected.find(user => user.socketId === SocketID)?.user;

    // Append ": " to the username
    name += ": ";

    // Iterate through connected clients
    user.connected.forEach(function (client) 
    {
        // Check if the client is not the sender
        if (client.socketId !== SocketID) 
        {
            // Emit a 'chat message' event to the client with sender's name concatenated with the message
            io.to(client.socketId).emit('chat message', name + msg);
        }
    });
  });


    // handle group messaging
    socket.on('Group' , (dic)=>
    {
      let SocketID = socket.id
      let name = user.connected.find(user => user.socketId === SocketID)?.user;
      name += ": "
      count = dic.recipient.length -1
      while (count > -1)
      {
        user.connected.forEach(function (client) {
        if (dic.recipient[count].trim() == client.user) {
          console.log(client.user)
              // Emit the 'chat message' event with sender's name to other connected clients
          io.to(client.socketId).emit('group', name + dic.msg);
      }
        });
      
        count--;
      }
    });

    // handle status
    socket.on('status', (msg) => 
    {
      user.connected.forEach(function(client) 
      {
        io.to(client.socketId).emit('status', msg);
      });

    });

    // handle remove
    socket.on('remove', (msg) => 
    {
      
      const index = user.connected.findIndex(client => client.socketId === socket.id);
      if (index !== -1) 
      {
        user.connected.splice(index, 1);
      }

      user.connected.forEach(function(client) 
      {
        io.to(client.socketId).emit('remove', msg);
      });

    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      user.connected.forEach(function(clientId) {
        io.to(clientId).emit('status' ,  " A message ")
  });
    });


  });

function handler(request, response) {
  let urlObj = url.parse(request.url, true, false)
  console.log("\n============================")
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let receivedData = ""

  //attached event handlers to collect the message data
  request.on("data", function(chunk) {
    receivedData += chunk;
  })

  //event handler for the end of the message
  request.on("end", function() {
    console.log("REQUEST END: ")
    console.log("received data: ", receivedData)
    console.log("type: ", typeof receivedData)

    if (request.method == "POST") {
      /*
      NOTHING LEFT TO DO HERE
      */
    }

    if (request.method == "GET") {
      //handle GET requests as static file requests
      fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
        if (err) {
          //report error to console
          console.log("ERROR: " + JSON.stringify(err))
          //respond with not found 404 to client
          response.writeHead(404)
          response.end(JSON.stringify(err))
          return
        }
        response.writeHead(200, {
          "Content-Type": get_mime(urlObj.pathname)
        })
        response.end(data)
      })
    }
  })
}

console.log(`Server Running at PORT ${PORT} CNTL-C to quit`)
console.log("To Test")
console.log(`Open several browsers at http://localhost:${PORT}/chatClient.html`)


