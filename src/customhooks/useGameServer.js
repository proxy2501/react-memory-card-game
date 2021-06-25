import { useCallback, useEffect, useMemo, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

function useGameServer(serverURL, numberStoredMessages) {
    // Creates the connection.
    const connection = useMemo(() => {
        return (
            new HubConnectionBuilder()
                .withUrl(serverURL)
                .build()
        );
    }, [serverURL]);

    const [users, setUsers] = useState([]);
    const [eventMessage, setEventMessage] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);

    const sendMessage = useCallback((receiver, content) => {
        connection.invoke("Message", receiver, JSON.stringify(content));
    }, [connection]);

    const pushLocalMessage = useCallback((sender, message) => {
        setChatMessages(prevState => {
            let newState = [...prevState];
            newState.push({sender, message});

            if (newState.length > numberStoredMessages) {
                newState.shift();
            }

            return newState;
        });
    }, [numberStoredMessages]);

    // Subscribes to server events with callbacks to handle them.
    useEffect(() => {

        // Sets initial users upon making a successful connection.
        connection.on("ConnectedUsers", users => {
            setUsers(users);
        });

        // Handles a new user connecting.
        connection.on("UserConnected", user => {
            setUsers(prevState => {
                let newState = [...prevState];
                newState.push(user);

                return newState;
            });

            setChatMessages(prevState => {
                let newState = [...prevState];
                newState.push({sender: "Server", message: (user + " connected!")});

                if (newState.length > numberStoredMessages) {
                    newState.shift();
                }

                return newState;
            });
        });

        // Handles a user disconnecting.
        connection.on("UserDisconnected", user => {
            setUsers(prevState => {
                let newState = [...prevState];
                let userIndex = newState.findIndex(element => element === user);
                newState.splice(userIndex, 1);

                return newState;
            });

            setChatMessages(prevState => {
                let newState = [...prevState];
                newState.push({sender: "Server", message: (user + " disconnected!")});

                if (newState.length > numberStoredMessages) {
                    newState.shift();
                }

                return newState;
            });
        });

        // Handles receiving a message from a user.
        connection.on("Message", (sender, content) => {

            let contentObj = JSON.parse(content);

            if (contentObj.type === "Chat") {
                setChatMessages(prevState => {
                    let newState = [...prevState];
                    newState.push({sender, message: contentObj.message});

                    if (newState.length > numberStoredMessages) {
                        newState.shift();
                    }

                    return newState;
                });
            }
            else {
                setEventMessage({ sender, ...contentObj });
            }
        });

        // Starts the connection to server.
        connection.start()
            .then(() => console.log("Connected to server!"))
            .catch(error => console.log(error));

        return () => {
            connection.off("ConnectedUsers");
            connection.off("UserConnected");
            connection.off("UserDisconnected");
            connection.off("Message");
            connection.stop()
                .then(() => console.log("Disconnected from server."));
        }
    }, [connection, numberStoredMessages]);

    return { users, chatMessages, setChatMessages, eventMessage, setEventMessage, sendMessage, pushLocalMessage };
}

export default useGameServer;