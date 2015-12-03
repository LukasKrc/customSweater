<?php
	define('UPLOAD_DIR', 'imgs/orders/');
	$img = $_POST['img'];
	print $_SERVER["CONTENT_LENGTH"];
	$img = str_replace('data:image/png;base64,', '', $img);
	$img = str_replace(' ', '+', $img);
	$data = base64_decode($img);
	$file = UPLOAD_DIR . '1.png';
	$myFile = fopen($file, 'w');
	$success = file_put_contents($file, $data);
	//print $success ? $file : 'Unable to save the file.';
?>