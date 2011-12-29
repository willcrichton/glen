/******************************************************
* socket.js
* Contains functions pertinent to multiplayer and server-
* client communication.
******************************************************/

Glen.packetHeaderEnd = "~END~";
Glen.packetDelimeter = "\r\n";

Glen.sendPacket = function(content, headers){
	if(!this.connected)
		return false;
	
	if(headers == undefined)
		this.socket.send(content);
	else
		this.socket.send(this.buildPacket(content,headers));
}

Glen.buildPacket = function(content,headers){
	var packet = '';
	for(key in headers)
		packet += key + ": " + headers[key] + this.packetDelimeter;
	
	packet += this.packetHeaderEnd + this.packetDelimeter;
	packet += content;
	return packet;
}

Glen.say = function(message){
	this.socket.send(
		this.buildPacket(message,{
			PacketType: 'chat'
		})
	);
}