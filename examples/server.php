<?php  /*  >php -q server.php  */

require_once("websocket.class.php");

error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

class ServerControl extends WebSocket {
	
	private $packetDelimeter = '~END~';
	
	// This gets an array of headers sent in the packet.
	// Headers must be of format 
	//		HeaderName: HeaderValue
	// "content" is a reserved header name. It holds the message body.
	function get_packet_headers($msg){
		$ret = array( 'content' => '' );
		$isContent = false;
		$args = explode("\r\n",$msg);
		$counter = 0;
		foreach($args as $header):
			$counter++;
			
			// We've found the body of the message if we reach this line.
			if($header == $this->packetDelimeter):
				$isContent = true;
				continue;
			endif;
			
			// If we're in the body section, append to the content of the message
			if($isContent): 
				$ret['content'] .= $header . ($counter == count($args) ? '' : "\r\n");
				$counter++;
				
			// Otherwise, put more headers into the array
			else:
				$parts = explode(':',$header);
				if(count($parts) > 1) 
					$ret[$parts[0]] = ltrim($parts[1]);
			endif;
		endforeach;
		return $ret;
	}
	
	function process($user, $msg){
		$headers = $this->get_packet_headers($msg);
		$content = $headers['content'];
		if(!isset($headers['PacketType'])):
			$user->send(json_encode(array(
				'error' => "You must set a PacketType.",
				'packet' => $msg,
				'headers' => $headers,
				'content' => $content
			)));
			return;
		endif;
		
		switch($headers['PacketType']):
			case 'chat':
				if(substr($content,0,1) == '/'):
					// They ran a command
					$args = explode(' ',substr($content, 1, strlen($content) - 1));
					$command = array_shift($args);
					switch($command):
						case "getplayers":
							$user->send(json_encode($this->users));
							break;
						default:
							$user->send($this->error("That is not a valid command."));
							break;
					endswitch;
				else:
					foreach($this->users as $u)
						$u->send("User $user->id says: $content");
				endif;
				break;
			case 'disconnect':
				$this->onDisconnect($user);
				break;
			case 'position':
				$packet = $this->buildPacket('position',array(
					id => $user->id,
					position => $content
				));
				foreach($this->users as $u)
					if($u->id != $user->id)
						$u->send($packet);
				break;
			default:
				$user->send($this->error('PacketType "' . $headers['PacketType'] . '" is unknown.'));
				break;
		endswitch;
	}
	
	function onConnect($user){
		// Send empty packet to avoid WebSocket bug. Find out how to fix this?
		$user->send('');
		
		// Send the player the data of all the players (and hisself is isMe is true)
		$data = array( 'PacketType' => 'load-players', 'data' => array() );
		foreach($this->users as $u):
			$data['data'][] = array(
				'id' => $u->id,
				'isMe' => $u->id == $user->id
			);
		endforeach;
		$user->send(json_encode($data));
		
		// Send the new player's data to all of the other players
		$data = json_encode(array(
			'PacketType' => 'new-player',
			'data' => array('id' => $user->id)
		));
		foreach($this->users as $u)
			if($u->id != $user->id)
				$u->send($data);
	
	}
	
	function onDisconnect($user){
		$data = $this->buildPacket('remove-player',array(
			'id' => $user->id
		));
		foreach($this->users as $u):
			if($u->id != $user->id)
				$u->send($data);
		endforeach;
	}
	
	function error($message,$extra=array()){
		$err = array( 'error' => $message );
		$err = array_merge( $err, $extra );
		return json_encode( $err );
	}
	
	function buildPacket($type='misc',$data=array()){
		return json_encode(array(
			PacketType => $type,
			data => $data
		));
	}
}

$master = new ServerControl("localhost",6967);

?>
