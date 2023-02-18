<!DOCTYPE html>
<html lang="en">
<head>
  <title>Comunidade ZDG - https://comunidadezdg.com.br/</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.5/css/bootstrap.min.css">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.5/js/bootstrap.min.js"></script>
	<link rel="stylesheet" href="index.css">
</head>
<body>

  <?php
    echo "<nav id='menu-h'>";
    echo "<ul>";
    echo "    <li><a href='https://comunidadezdg.com.br/'>Comunidade ZDG</a></li>";
	echo "    <li><a href='index.php'>Conexões</a></li>";
	echo "    <li><a href='index1.php'>Disparo de Botões Reply</a></li>";
	echo "    <li><a href='index2.php'>Disparo de Botões URL</a></li>";
	echo "    <li><a href='index3.php'>Disparo de Botões Call</a></li>";
    echo "    <li><a target='_blank' href='https://comunidadezdg.com.br/'><img src='https://comunidadezdg.com.br/wp-content/uploads/elementor/thumbs/icone-p7nqaeuwl6ck4tz33sz0asflw2opfsqwutv8l3hfk0.png' style='height:20px;'><br></a></li>";
    echo "</ul>";
    echo "</nav>";
	echo "<h2>Gestão de Disparos</h2>";
	echo "<hr>";
	
  	if(array_key_exists('button1', $_POST)) {
		button1();
	}
	function button1() {
		$txt = str_replace(PHP_EOL,'\n',$_POST['txt']);
		$btn1 = $_POST['btn1'];
		$btn2 = $_POST['btn2'];
		$btn3 = $_POST['btn3'];
		$title = $_POST['title'];
		$footer = $_POST['footer'];
		$min = $_POST['min'];
		$max = $_POST['max'];
		$leads = $_POST['leads'];
		$lines = explode(PHP_EOL, $leads);
		//$sessao = $_POST['sessao'];
		//$token = $_POST['token'];
		//$authorization = "Authorization: Bearer " . $token;
		foreach ($lines as $line) {
			sleep ( rand ( $min, $max));
			list($first) = explode(",", $line);
			list($_, $second) = explode(",", $line);
			$pieces = explode("@", $second);
			$sessao = $pieces[0];
			$token = $pieces[1];
			$authorization = "Authorization: Bearer " . $token;
			$curl = curl_init();
			$recip = 
			'{
			  "phone": "'.$first.'",
			  "message": "'.$txt.'",
			  "options": {
				"useTemplateButtons": "true",
				"buttons": [
				  {
					"id": "1",
					"text": "'.$btn1.'"
				  },
				  {
					"id": "2",
					"text": "'.$btn2.'"
				  },
				  {
					"id": "3",
					"text": "'.$btn3.'"
				  }
				],
				"title": "'.$title.'",
				"footer": "'.$footer.'"
			  }
			}';
			curl_setopt_array($curl, array(
			  CURLOPT_URL => 'http://localhost:21465/api/' . $sessao . '/send-buttons',
			  CURLOPT_RETURNTRANSFER => true,
			  CURLOPT_ENCODING => '',
			  CURLOPT_MAXREDIRS => 10,
			  CURLOPT_TIMEOUT => 0,
			  CURLOPT_FOLLOWLOCATION => true,
			  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			  CURLOPT_CUSTOMREQUEST => 'POST',
			  CURLOPT_POSTFIELDS => $recip,
			  CURLOPT_HTTPHEADER => array(
				'Content-Type: application/json', $authorization
			  ),
			));

			$response = curl_exec($curl);
			curl_close($curl);
			echo $response . '<br>';
			//echo substr($response,11, 7) . ' - ' . substr($response,44, 13);
		}
		echo "<hr>";
	}
	
  	echo "<form method='post'>";
	echo "<h4>Envio de botões REPLY</h4>";
	echo "LEADS => Insira a lista de leads,sender@token<br> <textarea class='form-control' name='leads' id='leads' cols='40' rows='5' placeholder='553588754197,sessao1@$2b$10PRZxJ8eXFTzb9UOoHqWXXeXuCC2PuXWI4GxmTbP2WTxk7Q3FoFhy.&#10;553588754197,sessao1@$2b$10PRZxJ8eXFTzb9UOoHqWXXeXuCC2PuXWI4GxmTbP2WTxk7Q3FoFhy.&#10;553588754197,sessao1@$2b$10PRZxJ8eXFTzb9UOoHqWXXeXuCC2PuXWI4GxmTbP2WTxk7Q3FoFhy.' style='width:50%' required></textarea>";
	echo "<br>";
	echo "MENSAGEM => Insira a sua mensagem<br> <textarea style='width:50%' class='form-control' name='txt' cols='40' rows='5' placeholder='Mensagem que será enviada'></textarea>";
	echo "<br>";
	echo "Título => Insira o título<br><input style='width:20%' class='form-control' type='text' name='title' id='title' placeholder='Insira o Título'>";
	echo "<br>";
	echo "Rodapé => Insira o rodapé<br><input style='width:20%' class='form-control' type='text' name='footer' id='footer' placeholder='Insira a Rodapé'>";
	echo "<br>";
	echo "Botão 1 => Insira o botão 1<br><input style='width:20%' class='form-control' type='text' name='btn1' id='btn1' placeholder='Insira o botão 1'>";
	echo "<br>";
	echo "Botão 2 => Insira o botão 2<br><input style='width:20%' class='form-control' type='text' name='btn2' id='btn2' placeholder='Insira o botão 2'>";
	echo "<br>";
	echo "Botão 3 => Insira o botão 3<br><input style='width:20%' class='form-control' type='text' name='btn3' id='btn3' placeholder='Insira o botão 3'>";
	echo "<br>";
	//echo "Sessão => Insira a sessão<br><input style='width:20%' class='form-control' type='text' name='sessao' id='sessao' placeholder='Insira a Sessão'>";
	//echo "<br>";
	//echo "Token => Insira o token<br><input style='width:20%' class='form-control' type='text' name='token' id='token' placeholder='Insira o Token'>";
	//echo "<br>";
	echo "Min: <input class='form-control' required placeholder='2' style='width:5%' type='text' name='min' />";
	echo "Max: <input class='form-control' required placeholder='31' style='width:5%' type='text' name='max' />";
	echo "<br>";
	echo "<input class='btn btn-success'type='submit' name='button1' class='button' value='Realizar disparo' />";
	echo "<br>";
	echo "<br>";
	echo "<hr>";
	echo "</form>";
	echo "<hr>";
	echo "<p>Desenvolvido por Comunidade ZDG</p>";
  

  

  ?>

</body>
</html>