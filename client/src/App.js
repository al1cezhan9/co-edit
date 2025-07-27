import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect (() => {
    const newSocket = new WebSocket('ws://localhost:5000'); // connect to backend WebSocket server
    setSocket(newSocket);

    newSocket.onopen = () => {  
      console.log('WebSocket connection established');
    }

    // handle incoming messages from the WebSocket server
    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'init') {
          setDocument(message.data); // initialize document with data from server
        } else if (message.type === 'update') {
          setDocument(message.data); // update document with new data
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    }

    return () => {
      newSocket.close(); // clean up WebSocket connection on component unmount
    };
  }, []);

  const handleChange = (event) => {
    const newDocument = event.target.value;
    setDocument(newDocument); // update local state with new document text
    if (socket && socket.readyState === WebSocket.OPEN) {
      // send updated document to server
      socket.send(JSON.stringify({ type: 'update', data: newDocument })); 
    }
  };

  return (
    <div className="App">
      <h1>Collaborative Text Editor</h1>
      <textarea 
        value={document} 
        onChange={handleChange} 
        placeholder="Start typing..." 
        rows="20" 
        cols="80"
      />
    </div>
  );

}

export default App;

