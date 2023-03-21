import {Server, Socket} from 'socket.io';
import http from 'http';


export const SocServer = ( http: http.Server) => {
  const io = new Server(http);
  // io.clients = {};

  io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  io.on('connection', function(socket: any) {
    console.log('Socket connection established')
    socket.on('SIGNIN', (id) => {
      // io.clients[id] = socket;
//console.log(io.clients);
    });

    socket.on('DIALOGS:JOIN', (dialogId: string) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });

    socket.on('DIALOGS:TYPING', (obj) => {
      socket.broadcast.emit('DIALOGS:TYPING', obj);
    });
  });

  return io;
};
