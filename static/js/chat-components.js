var FluxMixin = Fluxxor.FluxMixin(React),
	StoreWatchMixin = Fluxxor.StoreWatchMixin;

// Container 
var ChatContainer = React.createClass({
	mixins: [FluxMixin, StoreWatchMixin("ChatsStore")],

	getInitialState: function() {
		return {};
	},

	getStateFromFlux: function() {
		var flux = this.getFlux();
		var chatStoreState = flux.store("ChatsStore").getState();

		return {
			chats: chatStoreState
		}
	},

	render: function() {
		return (
      <div className="row-fluid">
        <div className="span12 well"> 
          <div className="row-fluid">
              <div className="span12">
                  <TabsRooms rooms={this.state.chats} />
              </div>
          </div>
          <div id="newRooms" className="tab-content">
          	<ChatRooms rooms={this.state.chats} />
          </div>
        </div>
      </div>
		);
	}
});

// nav-tabs
var ListItemTab = React.createClass({
	propTypes: {
    room: React.PropTypes.object.isRequired
 	},

  	render: function() {
  		var idString = this.props.room.room + "_tab";
  		var hrefString = "#" + this.props.room.room;
    	return (
    		<li id={idString} className={this.props.room.active}>
          <a href={hrefString} data-toggle="tab">{this.props.room.room}</a>
        </li>
    	);
  	}
});

var TabsRooms = React.createClass({
	propTypes: {
    rooms: React.PropTypes.array.isRequired
 	},

  leaveRoom: function() {
    console.log("dejamos room");
    var roomNameToLeave = $("#rooms_tabs > li.active > a").text();
    if (roomNameToLeave != "MainRoom") {
      socket.emit('unsubscribe', {'rooms':[roomNameToLeave]}); 
      
      // Toogle to MainRoom
      $('[href="#MainRoom"]').click();
    } else {
      console.log('Cannot leave MainRoom, sorry');
    }
  },

	render: function() {
		return (
      <ul id="rooms_tabs" className="nav nav-tabs">
        <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown"><i className="icon-th"></i>&nbsp;Options&nbsp;<b className="caret"></b></a>
            <ul className="dropdown-menu">
                <li><a href="#modal_joinroom" data-toggle="modal"><i className="icon-plus"></i>&nbsp;Join room</a></li>
                <li><a id="b_leave_room" href="#" onClick={this.leaveRoom}><i className="icon-minus"></i>&nbsp;Leave current room</a></li>
                <li className="divider"></li>
                <li><a href="#modal_setnick" data-toggle="modal"><i className="icon-user"></i>&nbsp;Set nickname</a></li>
            </ul>
        </li>
        {this.props.rooms.map(function(room, i) {
     			return (
     				<ListItemTab key={i} room={room} />
     			);
    		})}
      </ul>
		);
	}
});

var ListItemMessage = React.createClass({
	propTypes: {
    message: React.PropTypes.object.isRequired
 	},

  	render: function() {
    	return (
    		<div><span className="label label-info">{this.props.message.username}</span>&nbsp;&nbsp;{this.props.message.msg}</div>
    	);
  	}
});

var ListItemUser = React.createClass({
	propTypes: {
    user: React.PropTypes.object.isRequired
 	},

  	render: function() {
  		var userId = this.props.user.room + "-" + this.props.user.id;
    	return (
    		<span id={userId} className="badge badge-inverse">{this.props.user.username}</span>
    	);
  	}
});

var ListItemRoom = React.createClass({
	propTypes: {
    room: React.PropTypes.object.isRequired
 	},

  	render: function() {
  		var classString = "tab-pane " + this.props.room.active;
    	return (
    		<div id={this.props.room.room} className={classString}>
          <div className="row-fluid">
              <div className="span12 well">
                  <div className="chat--container">
                  	{this.props.room.messages.map(function(message, i) {
     						return (
     							<ListItemMessage key={i} message={message} />
     						);
  					})}
                  </div>
              </div>
          </div>
          <div className="row-fluid">
              <div className="span12">
                  <h3>Now chatting...</h3>
              </div>
          </div>
          <div className="row-fluid">
              <div className="span12">
          		{this.props.room.users.map(function(user, i) {
 						return (
 							<ListItemUser key={i} user={user} />
 						);
				})}
              </div>
          </div>
      </div>
    );
	}
});

var ChatRooms = React.createClass({
	propTypes: {
		rooms: React.PropTypes.array.isRequired
	},

	render: function() {
		return (
			<div id="newRooms" className="tab-content">
				{this.props.rooms.map(function(room, i) {
     			return (
     				<ListItemRoom key={i} room={room} />
     			);
     		})}
			</div>
		);
	}
});