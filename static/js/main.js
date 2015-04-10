
// Author: Sergio Castaño Arteaga
// Email: sergio.castano.arteaga@gmail.com
  
(function($){

    var debug = false;

    // Router
    window.AppRouter = Backbone.Router.extend({
        routes: {
            "room/:id": "joinRoom" // http://localhost:8888/#room/room1
        },

        joinRoom: function(id) {
            socket.emit('subscribe', {'rooms': [id]}); 
        }
    });
    // Instantiate the router
    window.app_router = new AppRouter();

    // ***************************************************************************
    // Socket.io events
    // ***************************************************************************
    
    socket = io.connect('http://localhost:8888');

    // Connection established
    socket.on('connected', function (data) {

        // Call to begin monitoring uri and route changes
        Backbone.history.start();

        if (debug) {
            // Subscription to rooms
            socket.emit('subscribe', {'username':'sergio', 'rooms':['sampleroom']});

            // Send sample message to room
            socket.emit('newMessage', {'room':'sampleroom', 'msg':'Hellooooooo!'});

            // Auto-disconnect after 10 minutes
            setInterval(function() {
                socket.emit('unsubscribe', {'rooms':['sampleroom']});
                socket.disconnect();
            }, 600000);
        }
    });

    // Disconnected from server
    socket.on('disconnect', function (data) {
        var info = {'room':'MainRoom', 'username':'ServerBot', 'msg':'----- Lost connection to server -----'};
        addMessage(info);
    });
    
    // Reconnected to server
    socket.on('reconnect', function (data) {
        var info = {'room':'MainRoom', 'username':'ServerBot', 'msg':'----- Reconnected to server -----'};
        addMessage(info);
    });

    // Subscription to room confirmed
    socket.on('subscriptionConfirmed', function(data) {
        // Create room space in interface
        flux.actions.createRoom(data.room);

        // Close modal if opened
        $('#modal_joinroom').modal('hide');
    });

    // Unsubscription to room confirmed
    socket.on('unsubscriptionConfirmed', function(data) {
        // Remove room space in interface
        flux.actions.removeRoom(data.room);
    });

    // User joins room
    socket.on('userJoinsRoom', function(data) {
        console.log("userJoinsRoom: %s", JSON.stringify(data));
        // Log join in conversation
        addMessage(data);  
    
        // Add user to connected users list
        addUser(data);
    });

    // User leaves room
    socket.on('userLeavesRoom', function(data) {
        console.log("userLeavesRoom: %s", JSON.stringify(data));
        // Log leave in conversation
        addMessage(data);

        // Remove user from connected users list
        removeUser(data);
    });

    // Message received
    socket.on('newMessage', function (data) {
        console.log("newMessage: %s", JSON.stringify(data));
        addMessage(data);
    });

    // Users in room received
    socket.on('usersInRoom', function(data) {
        console.log('usersInRoom: %s', JSON.stringify(data));

        // Add ServerBot user at first
        data.users.unshift({
            id: 0,
            username: "ServerBot",
            room: data.room
        });

        _.map(data.users, function(user) {
            flux.actions.addUser(user);
        });
    });

    // User nickname updated
    socket.on('userNicknameUpdated', function(data) {
        console.log("userNicknameUpdated: %s", JSON.stringify(data));
        updateNickname(data);

        msg = '----- ' + data.oldUsername + ' is now ' + data.newUsername + ' -----';
        var info = {'room':data.room, 'username':'ServerBot', 'msg':msg};
        addMessage(info);
    });

    // ***************************************************************************
    // Helpers
    // ***************************************************************************

    // Add message to room
    var addMessage = function(msg) {
        flux.actions.addMessage(msg);
    };
    
    // Add user to connected users list
    var addUser = function(user) {
        flux.actions.addUser(user); 
    };

    // Remove user from connected users list
    var removeUser = function(user) {
        flux.actions.removeUser(user);
    };

    // Get current room
    var getCurrentRoom = function() {
        return $('li[id$="_tab"][class="active"]').text().trim();
    };

    // Get message text from input field
    var getMessageText = function() {
        var text = $('#message_text').val();
        $('#message_text').val("");
        return text;
    };

    // Get room name from input field
    var getRoomName = function() {
        var name = $('#room_name').val();
        $('#room_name').val("");
        return name;
    };

    // Get nickname from input field
    var getNickname = function() {
        var nickname = $('#nickname').val();
        $('#nickname').val("");
        if (nickname != "") {
            return nickname;
        } else {
            return false;
        }
    };

    // Update nickname in badges (all collections)
    var updateNickname = function(data) {
        flux.actions.updateUsername(data);  
    };

    // ***************************************************************************
    // Events
    // ***************************************************************************

    // Send new message
    $('#b_send_message').click(function(eventObject) {
        eventObject.preventDefault();
        if ($('#message_text').val() != "") {
            socket.emit('newMessage', {'room':getCurrentRoom(), 'msg':getMessageText()});
        }
    });

    // Click button "Join room" to press Return key
    $('#room_name').keyup(function(event){
        if( event.keyCode == 13){
            $('#b_join_room').click();
        }
    });

    // Join new room
    $('#b_join_room').click(function(eventObject) {
        eventObject.preventDefault();
        socket.emit('subscribe', {'rooms':[getRoomName()]}); 
    });

    // Set nickname
    $('#b_set_nickname').click(function(eventObject) {
        eventObject.preventDefault();
        var newName = getNickname();
        if (newName) {
            socket.emit('setNickname', {'username':newName});
        }

        // Close modal if opened
        $('#modal_setnick').modal('hide');
    });

    // Click button "Set nickname" to press Return key
    $('#nickname').keyup(function(event){
        if( event.keyCode == 13){
            $('#b_set_nickname').click();
        }
    });

})(jQuery);

