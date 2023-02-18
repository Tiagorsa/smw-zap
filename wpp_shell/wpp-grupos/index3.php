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
	echo "    <li><a href='index1.php'>Criar Grupos</a></li>";
	echo "    <li><a href='index2.php'>Alterar Título</a></li>";
	echo "    <li><a href='index3.php'>Alterar Descrição</a></li>";
	echo "    <li><a href='index4.php'>Alterar Imagem</a></li>";
	echo "    <li><a href='index5.php'>Add Usuário</a></li>";
	echo "    <li><a href='index6.php'>Del Usuário</a></li>";
	echo "    <li><a href='index7.php'>Add Admin</a></li>";
	echo "    <li><a href='index8.php'>Del Admin</a></li>";
	echo "    <li><a href='index9.php'>Somente admins</a></li>";
    echo "    <li><a target='_blank' href='https://comunidadezdg.com.br/'><img src='https://comunidadezdg.com.br/wp-content/uploads/elementor/thumbs/icone-p7nqaeuwl6ck4tz33sz0asflw2opfsqwutv8l3hfk0.png' style='height:20px;'><br></a></li>";
    echo "</ul>";
    echo "</nav>";
	echo "<h2>Gestão de Disparos</h2>";
	echo "<hr>";
	
  	if(array_key_exists('button1', $_POST)) {
		button1();
	}
	function button1() {
		$txt = $_POST['txt'];
		$min = $_POST['min'];
		$max = $_POST['max'];
		$groups = $_POST['groups'];
		$lines = explode(PHP_EOL, $groups);
		$sessao = $_POST['sessao'];
		$token = $_POST['token'];
		$authorization = "Authorization: Bearer " . $token;
		foreach ($lines as $line) {
			sleep ( rand ( $min, $max));
			list($first) = explode(",", $line);
			$curl = curl_init();
			$postData = [ "groupId" => $line,
				"description" => $txt
			];
			curl_setopt_array($curl, array(
			  CURLOPT_URL => 'http://localhost:21465/api/' . $sessao . '/group-description',
			  CURLOPT_RETURNTRANSFER => true,
			  CURLOPT_ENCODING => '',
			  CURLOPT_MAXREDIRS => 10,
			  CURLOPT_TIMEOUT => 0,
			  CURLOPT_FOLLOWLOCATION => true,
			  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			  CURLOPT_CUSTOMREQUEST => 'POST',
			  CURLOPT_POSTFIELDS => json_encode($postData),
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
	echo "<h4>Mudar a descrição dos grupos em massa</h4>";
	echo "Grupos => Insira a lista com o ID dos grupos<br> <textarea class='form-control' name='groups' id='groups' cols='40' rows='5' placeholder='120363027690678473@g.us&#10;120363027690678473@g.us&#10;120363027690678473@g.us' style='width:50%' required></textarea>";
	echo "<br>";
	echo "Descrição => Insira a nova descrição<br><input style='width:20%' class='form-control' type='text' name='txt' id='txt' placeholder='Nova Descrição'>";
	echo "<br>";
	echo "Sessão => Insira a sessão<br><input style='width:20%' class='form-control' type='text' name='sessao' id='sessao' placeholder='Insira a Sessão'>";
	echo "<br>";
	echo "Token => Insira o token<br><input style='width:20%' class='form-control' type='text' name='token' id='token' placeholder='Insira o Token'>";
	echo "<br>";
	echo "Min: <input class='form-control' required placeholder='2' style='width:5%' type='text' name='min' />";
	echo "Max: <input class='form-control' required placeholder='31' style='width:5%' type='text' name='max' />";
	echo "<br>";
	echo "<input class='btn btn-success'type='submit' name='button1' class='button' value='Executar' />";
	echo "<br>";
	echo "<br>";
	echo "<hr>";
	echo "</form>";
	echo "<hr>";
	echo "<p>Desenvolvido por Comunidade ZDG</p>";
  

  

  ?>

</body>
</html>