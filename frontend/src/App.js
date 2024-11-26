import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Use the backend server's port here

function App() {
    const [players, setPlayers] = useState([]);
    const [rollResult, setRollResult] = useState(null);
    const [myName, setMyName] = useState('');
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
      console.log("Socket connected:", socket.connected);  // Debug log for socket connection status
      socket.on('connect', () => {
          console.log("Socket connected to server!");
      });
  
      socket.on('updatePlayers', (data) => setPlayers(data));
      socket.on('playerMoved', ({ player, roll }) => {
          alert(`${player.name} rolled a ${roll}`);
          setRollResult(roll);
      });
  
      return () => {
          socket.off('playerMoved');
          socket.off('updatePlayers');
      };
  }, []);
  

    const joinGame = () => {
        const name = prompt('Enter your name:');
        setMyName(name);
        socket.emit('join', name); // Notify the server to add the player
        setGameStarted(true); // Enable the "Roll Dice" button once the game starts
    };

    const rollDice = () => {
      console.log("Roll button clicked!"); // Debug log
      socket.emit('rollDice'); // Send the roll event to the server
  };
  

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Business Tour Clone</h1>
            {!gameStarted ? (
                <button onClick={joinGame}>Join Game</button>
            ) : (
                <div>
                    <h2>Welcome, {myName}!</h2> {/* Show the player's name */}
                    <button onClick={rollDice}>Roll Dice</button>
                    <p>You rolled: {rollResult || 'Roll to start!'}</p>
                </div>
            )}
            <h2>Players:</h2>
            <ul>
                {players.map((player) => (
                    <li key={player.id}>
                        {player.name}: ${player.money}, Position: {player.position}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
