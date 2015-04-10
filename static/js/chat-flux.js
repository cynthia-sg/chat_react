var chats = [];

// STORES

var ChatStore = Fluxxor.createStore({

	initialize: function() {
		this.state = chats;
        this.bindActions(
            "ADD_USER", this.onAddUser,
            "ADD_MESSAGE", this.onAddMessage,
            "CREATE_ROOM", this.onCreateRoom,
            "REMOVE_ROOM", this.onRemoveRoom,
            "REMOVE_USER", this.onRemoveUser,
            "UPDATE_USERNAME", this.onUpdateUsername
        );

        this.onCreateRoom("MainRoom");
	},

    onAddUser: function(user) {
        _.map(this.state, function(room) {
            if (room.room == user.room) {
                if (_.where(room.users, user).length == 0) {
                    room.users.push(user);
                }
            }
        });
        this.emit("change");
    },

    onRemoveUser: function(userToRemove) {
        _.map(this.state, function(room) {
            _.map(room.users, function(user, i) {
                if (user.id == userToRemove.id) {
                    room.users.splice(i,1);
                    return false;
                }
            });
        });
        this.emit("change");
    },

    onAddMessage: function(msg) {
        _.map(this.state, function(room) {
            if (room.room == msg.room) {
                room.messages.push(msg);
            }
        });
        this.emit("change");
    },

    onCreateRoom: function(roomName) {
        if (_.where(this.state, {room: roomName}).length == 0) {
            var newRoom = {
                "room": roomName,
                "active": ((roomName == "MainRoom") ? "active": ""),
                "users": [{
                    "room": roomName,
                    "username": "ServerBot",
                    "id": 0
                }],
                "messages": [{
                    "room": roomName,
                    "username": "ServerBot",
                    "msg": "----- Welcome to the chat server ----"
                }]
            }

            // Get users connected to room
            socket.emit('getUsersInRoom', {'room':roomName});

            this.state.push(newRoom);
            this.emit("change");

            $("#" + roomName + "_tab a").click();                        
        }
    },

    onRemoveRoom: function(roomName) {
        this.state = _.filter(this.state, function(room) {
            return room.room != roomName;
        });
        this.emit("change");
    },

    onUpdateUsername: function(userToUpdate) {
        console.log(userToUpdate);
        _.map(this.state, function(room) {
            _.map(room.users, function(user) {
                if (user.id == userToUpdate.id) {
                    // TODO - update nickname
                    user.username = userToUpdate.newUsername;
                    return false;
                }
            });
        });
        this.emit("change");
    },

	getState: function() {
		return this.state;
	}
});

// ACTIONS

var chatActions = {
    addUser: function(user) {
        this.dispatch("ADD_USER", user);
    },
    addMessage: function(msg) {
        this.dispatch("ADD_MESSAGE", msg);
    },
    createRoom: function(newRoom) {
        this.dispatch("CREATE_ROOM", newRoom);
    },
    removeRoom: function(roomName) {
        this.dispatch("REMOVE_ROOM", roomName);
    },
    removeUser: function(user) {
        this.dispatch("REMOVE_USER", user);
    },
    updateUsername: function(user) {
        this.dispatch("UPDATE_USERNAME", user);
    }
};
