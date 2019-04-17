const axios = require('axios');
const Lingo = require('./lib').default.server;
const WebSocketClient = require('websocket').client;

const lingo = new Lingo();

setTimeout(() => {
  // axios.get('http://localhost:9001/device.json')
  //   .then(res => {
  //     console.log('device: ', res.data);
  //   })
  //   .catch(err => {
  //     console.log('err');
  //   });
  //
  // axios.get('http://localhost:9001/is-busy')
  //   .then(res => {
  //     console.log('busy status: ', res.data);
  //   })
  //   .catch(err => {
  //     console.log('err');
  //   });

  const client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
      console.log('Connection Error: ' + error.toString());
    });
    connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log('Received: ' + message.utf8Data);
      }
    });

    let message = Buffer.from(JSON.stringify({}));
    connection.sendBytes(message);

    // function sendNumber() {
    //   if (connection.connected) {
    //     var number = Math.round(Math.random() * 0xFFFFFF);
    //     connection.sendUTF(number.toString());
    //     setTimeout(sendNumber, 1000);
    //   }
    // }
    // sendNumber();
  });

  client.connect('ws://localhost:9001/', null, 'http://localhost:9001/', { 'Content-Type': 'application/json' }, null);

}, 500);
