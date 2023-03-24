import socket from 'socket.io';
import http from 'http';


export const SocServer = ( http: http.Server) => {
  const io = socket(http);
  // io.clients = {};

  io.on("connect_error", (err: any) => {
    console.log(`connect_error due to ${err.message}`);
  });

  io.on('connection', function(socket: any) {
    console.log('Socket connection established')
    socket.on('SIGNIN', () => {
      // io.clients[id] = socket;
//console.log(io.clients);
    });

    socket.on('DIALOGS:JOIN', (dialogId: string) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });

    socket.on('DIALOGS:TYPING', (obj: any) => {
      socket.broadcast.emit('DIALOGS:TYPING', obj);
    });
  });

  return io;
};
