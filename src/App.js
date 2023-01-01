import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io()


function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [queue, setQueue] = useState(null);
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      // join room
      socket.emit('join_room', { room: 'radityaharya' });
      console.log('connected');
    } );
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('pong', (data) => {
      setLastPong(JSON.stringify(data));
      console.log('pong', data);
    });
    socket.on('currently_playing', (data) => {
      console.log('currently_playing', data);
      setCurrentlyPlaying(data["queue"]["currently_playing"]);
      setQueue(data["queue"]["queue"]);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);


  const sendPing = () => {
    socket.emit('ping', { message: 'Hello from client' });
  };


  return (
    <div>
      <p>Connected: { '' + isConnected }</p>
      <p>Last pong: { lastPong || '-' }</p>
      <p>Socket ID: { socket.id }</p>
      <p>Socket namespace: { socket.nsp }</p>
      <p>Socket URL: { socket.io.uri }</p>
      <p>Socket options: { JSON.stringify(socket.io.opts) }</p>
      <p>Currently playing: { JSON.stringify(currentlyPlaying) }</p>
      <p>Queue: { JSON.stringify(queue) }</p>
      <button onClick={ sendPing }>Send ping</button>
    </div>
  );
}

export default App;