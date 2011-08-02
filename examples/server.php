<?php  /*  >php -q server.php  */

require_once("websocket.class.php");

error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

class ServerControl extends WebSocket {
	function process($user, $msg){
		$this->send(substr($msg,0,1));
		if(substr($msg,0,1) == '/'):
			// They ran a command
			$args = explode(' ',substr($msg, 1, strlen($msg) - 1));
			$command = array_shift($args);
			switch($command):
				case "test":
					$this->send($user->socket,"Test.");
					break;
				default:
					$this->send($user->socket,"That is not a valid command.");
					break;
			endswitch;
		else:
			foreach($this->users as $u)
				$this->send($u->socket,$msg);
			$this->send($user->socket,"There are currently " . count($this->users) . " users online.");
			//$this->send($user->socket,json_encode($this->users));
		endif;
	}
}

$master  = new ServerControl("localhost",6994);

?>
