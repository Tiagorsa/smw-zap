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
	echo "    <li><a href='index2.php'>Disparo de Imagem URL</a></li>";
	echo "    <li><a href='index3.php'>Disparo de Imagem PATH</a></li>";
	echo "    <li><a href='index4.php'>Disparo de Áudio Gravado</a></li>";
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
	function button1() {
		$token = $_POST['token'];
		$sessao = $_POST['sessao'];
		$url = "http://localhost:8000/criar-sessao";	
		$ch = curl_init( $url );
		$payload = json_encode( array( "id" => $sessao, "token" => $token) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	function button2() {
		$sessaoScan = $_POST['sessaoScan'];
		$path = 'C:/Users/Pedro/Desktop/bot-zdg-main/qrcode/' . $sessaoScan . '/qrcode.png';
		$imagedata = @file_get_contents($path);
		if($imagedata === null){
			echo 'QrCode OK';
			echo "<hr>";
		}
		else if($imagedata != null){
			$base64 = base64_encode($imagedata);
			echo '<img src="data:image/png;base64,'.$base64.'">';
			echo "<hr>";
		}

	}
	function button3() {
		$sessaoDel = $_POST['sessaoDel'];
		$tokenDel = $_POST['tokenDel'];
		$url = "http://localhost:8000/deletar-sessao";	
		$ch = curl_init( $url );
		$payload = json_encode( array( "id" => $sessaoDel, "token" => $tokenDel) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	function button4() {
		foreach(glob('C:/Users/Pedro/Desktop/bot-zdg-main/qrcode/*', GLOB_ONLYDIR) as $dir) {
			$dir = str_replace('C:/Users/Pedro/Desktop/bot-zdg-main/qrcode/', '', $dir);
			echo 'Sessão: ' . $dir . '<br>';
		}
		echo "<hr>";
	}
	function button5() {
		$tokenStatus = $_POST['tokenStatus'];
		$sessaoStatus = $_POST['sessaoStatus'];
		$url = "http://localhost:8000/status-sessao";	
		$ch = curl_init( $url );
		$payload = json_encode( array( "id" => $sessaoStatus, "token" => $tokenStatus) );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		$result = curl_exec($ch);
		curl_close($ch);
		echo "<pre>$result</pre>";
		echo "<hr>";
	}
	
	echo "<form method='post'>";
	echo "<nav>";
    echo "<div class='nav nav-tabs' id='nav-tab' role='tablist'>";
    echo "<button class='nav-link active' id='nav-1-tab' data-toggle='tab' data-target='#nav-1' type='button' role='tab' aria-controls='nav-1' aria-selected='true'>Criar Sessões</button>";
    echo "<button class='nav-link' id='nav-2-tab' data-toggle='tab' data-target='#nav-2' type='button' role='tab' aria-controls='nav-2' aria-selected='false'>Capturar QrCode</button>";
    echo "<button class='nav-link' id='nav-3-tab' data-toggle='tab' data-target='#nav-3' type='button' role='tab' aria-controls='nav-3' aria-selected='false'>Deletar Sessão</button>";
	echo "<button class='nav-link' id='nav-4-tab' data-toggle='tab' data-target='#nav-4' type='button' role='tab' aria-controls='nav-4' aria-selected='false'>Status Sessão</button>";
	echo "<button class='nav-link' id='nav-5-tab' data-toggle='tab' data-target='#nav-5' type='button' role='tab' aria-controls='nav-5' aria-selected='false'>Listar Sessões</button>";
    echo "</div>";
	echo "</nav>";
	echo "<div class='tab-content' id='nav-tabContent'>";
    echo "<div class='tab-pane fade show active' id='nav-1' role='tabpanel' aria-labelledby='nav-1-tab'>";
	echo "<br>";
	echo "<h4>Criar Sessões</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessao' id='sessao' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='token' id='token' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success'type='submit' name='button1' class='button' value='Criar Sessão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
    echo "<div class='tab-pane fade' id='nav-2' role='tabpanel' aria-labelledby='nav-2-tab'>";
	echo "<br>";
	echo "<h4>Capturar QrCode</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoScan' id='sessaoScan' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button2' class='button' value='Capturar QrCode' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
    echo "<div class='tab-pane fade' id='nav-3' role='tabpanel' aria-labelledby='nav-3-tab'>";
	echo "<br>";
	echo "<h4>Deletar Sessão</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoDel' id='sessaoDel' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='tokenDel' id='tokenDel' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success' type='submit' name='button3' class='button' value='Deletar Sessão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-4' role='tabpanel' aria-labelledby='nav-4-tab'>";
	echo "<br>";
	echo "<h4>Status Sessão</h4>";
	echo "<input style='width:20%' class='form-control'type='text' name='sessaoStatus' id='sessaoStatus' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "<input style='width:20%' class='form-control'type='text' name='tokenStatus' id='tokenStatus' placeholder='Insira o Token'>";
	echo "<br>";
	echo "<input class='btn btn-success'type='submit' name='button5' class='button' value='Criar Sessão' />";
	echo "<br>";
	echo "<hr>";
	echo "</div>";
	echo "<div class='tab-pane fade' id='nav-5' role='tabpanel' aria-labelledby='nav-5-tab'>";
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