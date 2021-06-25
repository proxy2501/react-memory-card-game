import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ServerContext } from './ServerContext';
import { ThemeContext } from './ThemeContext';
import './stylesheets/chatwindow.css';

function ChatWindow(props) {
    const { opponent } = props;
    const theme = useContext(ThemeContext);
    const server = useContext(ServerContext);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const buttonStyle = { backgroundColor: theme.buttonColor, color: theme.buttonTextColor, textShadow: theme.textShadow };

    // Sends a chat message to all users, if in lobby. Otherwise sends only to opponent.
    const sendMessage = useCallback(() => {
        if (messageInput === "") return;

        if (opponent) {
            server.sendMessage(opponent, { type: "Chat", message: messageInput });
        }
        else {
            server.users.forEach(user => {
                server.sendMessage(user, { type: "Chat", message: messageInput });
            });
        }

        server.pushLocalMessage("Player", messageInput);

        setMessageInput("");
    }, [messageInput, server, opponent]);

    const handleMsgInputChange = useCallback(event => {
        setMessageInput(event.target.value);
    }, []);

    const handleMsgInputKeyDown = useCallback(event => {
        if (event.key === 'Enter')
            sendMessage();
    }, [sendMessage]);

    // Construct chat messages from chatMessage objects.
    useEffect(() => {
        let tempMessages = [];
        if (!opponent) { // If in lobby, get all messages, including server messages.
            server.chatMessages.forEach(chatMessage => {
                if (chatMessage.sender === "Server") {
                    tempMessages.push(chatMessage.message);
                }
                else if(chatMessage.sender === "Player") {
                    tempMessages.push("Me: " + chatMessage.message);
                }
                else {
                    tempMessages.push(chatMessage.sender + ": " + chatMessage.message);
                }
            });
        }
        else { // If in game, get player and opponent messages only.
            server.chatMessages.forEach(chatMessage => {
                if (chatMessage.sender === opponent) {
                    tempMessages.push(chatMessage.sender + ": " + chatMessage.message);
                }
                else if (chatMessage.sender === "Player") {
                    tempMessages.push("Me: " + chatMessage.message);
                }
            });
        }

        setMessages(tempMessages);

    }, [opponent, server.chatMessages]);

    return (
        <div className="chat-window" style={{ backgroundColor: theme.backgroundBoxColor }}>
            <textarea className="messages" readOnly={true} value={messages.join("\n")} />
            <div className="input">
                <input onChange={handleMsgInputChange} onKeyDown={handleMsgInputKeyDown} value={messageInput}></input>
                <button style={buttonStyle} onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatWindow;