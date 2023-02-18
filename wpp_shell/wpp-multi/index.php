<!DOCTYPE html>
<html lang="en">
<head>
  <title>Comunidade ZDG - https://comunidadezdg.com.br/</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
	<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" crossorigin="anonymous"></script>
	<link rel="stylesheet" href="index.css">
</head>
<body>

  <?php
    echo "<nav id='menu-h'>";
    echo "<ul>";
    echo "    <li><a href='https://comunidadezdg.com.br/'>Comunidade ZDG</a></li>";
	echo "    <li><a href='index.php'>Conexões</a></li>";
	echo "    <li><a href='index1.php'>Disparo de Texto</a></li>";
	echo "    <li><a href='index2.php'>Disparo de Imagem</a></li>";
	echo "    <li><a href='index3.php'>Disparo de Link</a></li>";
	echo "    <li><a href='index4.php'>Disparo de Áudio Gravado</a></li>";
	echo "    <li><a href='index5.php'>Disparo de Localização</a></li>";
	echo "    <li><a href='index6.php'>Disparo de VCard</a></li>";
    echo "    <li><a target='_blank' href='https://comunidadezdg.com.br/'><img src='https://comunidadezdg.com.br/wp-content/uploads/elementor/thumbs/icone-p7nqaeuwl6ck4tz33sz0asflw2opfsqwutv8l3hfk0.png' style='height:20px;'><br></a></li>";
    echo "</ul>";
    echo "</nav>";
	echo "<h2>Gestão de Sessões</h2>";
	echo "<hr>";
	
  	if(array_key_exists('button1', $_POST)) {
		button1();
	}
	else if(array_key_exists('button2', $_POST)) {
		button2();
	}
	else if(array_key_exists('button3', $_POST)) {
		button3();
	}
	else if(array_key_exists('button4', $_POST)) {
		button4();
	}
	else if(array_key_exists('button5', $_POST)) {
		button5();
	}
	else if(array_key_exists('button6', $_POST)) {
		button6();
	}
	else if(array_key_exists('button7', $_POST)) {
		button7();
	}
	else if(array_key_exists('button8', $_POST)) {
		button8();
	}
	function button1() {
		$secret = $_POST['secret'];
		$sessao = $_POST['sessao'];
		$url = "http://localhost:21465/api/" . $sessao . "/" . $secret . "/generate-token";	
		$ch = curl_init( $url );
		$payload = json_encode( array( "zdg"=> 'zdg' ) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	function button2() {
		$token = $_POST['token'];
		$sessaoStart = $_POST['sessaoStart'];
		$authorization = "Authorization: Bearer " . $token;
		$urlStart = "http://localhost:21465/api/" . $sessaoStart . "/start-session";	
		$ch = curl_init( $urlStart );
		$payload = json_encode( array( "zdg"=> 'zdg' ) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json', $authorization));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	function button3() {
		sleep(2);
		$tokenQrCode = $_POST['tokenQrCode'];
		$sessaoQrCode = $_POST['sessaoQrCode'];
		$authorizationQrCode = "Authorization: Bearer " . $tokenQrCode;
		$urlQrCode = "http://localhost:21465/api/" . $sessaoQrCode . "/qrcode-session";	
		$curl = curl_init();
		curl_setopt_array($curl, array(
		  CURLOPT_URL => $urlQrCode ,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'GET',
		  CURLOPT_HTTPHEADER => array(
			$authorizationQrCode
		  ),
		));
		$response = curl_exec($curl);
		curl_close($curl);
		echo '<img src="data:image/png;base64,'.base64_encode($response).'">';
		echo "<hr>";
	}
	function button4() {
		foreach(glob('/home/deployzdg/wppconnect-server/userDataDir/*', GLOB_ONLYDIR) as $dir) {
			$dir = str_replace('/home/deployzdg/wppconnect-server/userDataDir/', '', $dir);
			echo 'Sessão: ' . $dir . '<br>';
		}
		echo "<hr>";
	}
	function button5() {
		$tokenStatus = $_POST['tokenStatus'];
		$sessaoStatus = $_POST['sessaoStatus'];
		$authorizationStatus = "Authorization: Bearer " . $tokenStatus;
		$urlStatus = "http://localhost:21465/api/" . $sessaoStatus . "/check-connection-session";	
		$curl = curl_init();
		curl_setopt_array($curl, array(
		  CURLOPT_URL => $urlStatus ,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'GET',
		  CURLOPT_HTTPHEADER => array(
			$authorizationStatus
		  ),
		));
		$response = curl_exec($curl);
		curl_close($curl);
		echo "<pre>$response</pre>";
		echo "<hr>";
	}
	function button6() {
		$tokenFechar = $_POST['tokenFechar'];
		$sessaoFechar = $_POST['sessaoFechar'];
		$authorizationFechar = "Authorization: Bearer " . $tokenFechar;
		$urlFechar = "http://localhost:21465/api/" . $sessaoFechar . "/close-session";	
		$ch = curl_init( $urlFechar );
		$payload = json_encode( array( "zdg"=> 'zdg' ) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json', $authorizationFechar));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	function button7() {
		$tokenLogout = $_POST['tokenLogout'];
		$sessaoLogout = $_POST['sessaoLogout'];
		$authorizationLogout = "Authorization: Bearer " . $tokenLogout;
		$urlLogout = "http://localhost:21465/api/" . $sessaoLogout . "/logout-session";	
		$ch = curl_init( $urlLogout );
		$payload = json_encode( array( "zdg"=> 'zdg' ) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json', $authorizationLogout));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	function button8() {
		$dir = '/home/deployzdg/wppconnect-server/userDataDir/' . $_POST['sessaoDelete'];
		if(file_exists($dir)){
			$di = new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS);
			$ri = new RecursiveIteratorIterator($di, RecursiveIteratorIterator::CHILD_FIRST);
			foreach ( $ri as $file ) {
				$file->isDir() ?  rmdir($file) : unlink($file);
			}
		}
		rmdir($dir);
	}
	
  	echo "<form method='post'>";
	
	echo "<nav>";
    echo "<div class='nav nav-tabs' id='nav-tab' role='tablist'>";
    echo "<button class='nav-link active' id='nav-1-tab' data-toggle='tab' data-target='#nav-1' type='button' role='tab' aria-controls='nav-1' aria-selected='true'>Criar Sessões</button>";
    echo "<button class='nav-link' id='nav-2-tab' data-toggle='tab' data-target='#nav-2' type='button' role='tab' aria-controls='nav-2' aria-selected='false'>Iniciar Sessão</button>";
    echo "<button class='nav-link' id='nav-3-tab' data-toggle='tab' data-target='#nav-3' type='button' role='tab' aria-controls='nav-3' aria-selected='false'>Capturar QRCode</button>";
	echo "<button class='nav-link' id='nav-4-tab' data-toggle='tab' data-target='#nav-4' type='button' role='tab' aria-controls='nav-4' aria-selected='false'>Status da Conexão</button>";
	echo "<button class='nav-link' id='nav-5-tab' data-toggle='tab' data-target='#nav-5' type='button' role='tab' aria-controls='nav-5' aria-selected='false'>Fechar Conexão</button>";
	echo "<button class='nav-link' id='nav-6-tab' data-toggle='tab' data-target='#nav-6' type='button' role='tab' aria-controls='nav-6' aria-selected='false'>LogOut Sessão</button>";
	echo "<button class='nav-link' id='nav-7-tab' data-toggle='tab' data-target='#nav-7' type='button' role='tab' aria-controls='nav-7' aria-selected='false'>Deletar Sessão</button>";
	echo "<button class='nav-link' id='nav-8-tab' data-toggle='tab' data-target='#nav-8' type='button' role='tab' aria-controls='nav-8' aria-selected='false'>Listar Sessões</button>";
    echo "</div>";
	echo "</nav>";
	echo "<div class='tab-content' id='nav-tabContent'>";
    echo "<div class='tab-pane fade show active' id='nav-1' role='tabpanel' aria-labelledby='nav-1-tab'>";
	echo "<br>";
	echo "<h4>Criar Sessões</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessao' id='sessao' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='secret' id='secret' placeholder='Insira o Secret'>";
	echo "<br>";
	echo "<input class='btn btn-success'type='submit' name='button1' class='button' value='Criar Sessão' />";
	echo "<br>";
	echo "<hr>";

	echo "</div>";
    echo "<div class='tab-pane fade' id='nav-2' role='tabpanel' aria-labelledby='nav-2-tab'>";
	echo "<br>";
	echo "<h4>Iniciar Sessões</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoStart' id='sessaoStart' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='token' id='token' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button2' class='button' value='Iniciar Sessão' />";
	echo "<br>";
	echo "<hr>";
	
	echo "</div>";
    echo "<div class='tab-pane fade' id='nav-3' role='tabpanel' aria-labelledby='nav-3-tab'>";
	echo "<br>";
	echo "<h4>Capturar QrCode</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoQrCode' id='sessaoQrCode' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='tokenQrCode' id='tokenQrCode' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button3' class='button' value='Captura QrCode' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-4' role='tabpanel' aria-labelledby='nav-4-tab'>";
	echo "<br>";
	echo "<h4>Status da Conexão</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoStatus' id='sessaoStatus' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='tokenStatus' id='tokenStatus' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button5' class='button' value='Status da Conexão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-5' role='tabpanel' aria-labelledby='nav-5-tab'>";
	echo "<br>";
	echo "<h4>Fechar Conexão</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoFechar' id='sessaoFechar' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='tokenFechar' id='tokenFechar' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button6' class='button' value='Fechar Conexão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-6' role='tabpanel' aria-labelledby='nav-6-tab'>";
	echo "<br>";
	echo "<h4>Logout Conexão</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoLogout' id='sessaoLogout' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='tokenLogout' id='tokenLogout' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button7' class='button' value='Logout Conexão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-7' role='tabpanel' aria-labelledby='nav-7-tab'>";
	echo "<br>";
	echo "<h4>Deletar Conexão</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoDelete' id='sessaoDelete' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button8' class='button' value='Deletar Conexão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-8' role='tabpanel' aria-labelledby='nav-8-tab'>";
	echo "<br>";
	echo "<h4>Listar Sessões</h4>";
	echo "<input class='btn btn-success' type='submit' name='button4' value='Listar' />";
	echo "<br>";
	echo "<hr>";
	
	echo "</div>";
	echo "</div>";
	
	echo "</form>";
	echo "<hr>";
	echo "<p>Desenvolvido por Comunidade ZDG</p>";
  

  

  ?>

</body>
</html>