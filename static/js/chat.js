// MAin FILE

if (!flux) {
	var flux = new Fluxxor.Flux({}, {});
	flux.on("dispatch", function(type, payload) {
  		if (console && console.log) {
    		console.log("[Dispatch]", type, payload);
  		}	
	});	
}

var chatStores = {
  	ChatsStore: new ChatStore()
};

flux.addStores(chatStores);
flux.addActions(chatActions);

React.render(
  	<ChatContainer flux={flux} />,
  	document.getElementById('content')
);
