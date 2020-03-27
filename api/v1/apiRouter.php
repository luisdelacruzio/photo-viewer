<?php

use PhotoViewer\Api\V1\Controller;

require __DIR__ . '/../../vendor/autoload.php';
require 'classes/Images.class.php';
require 'classes/Controller.class.php';

// default response header should be json
header('Content-type: application/json');

// init the response controller class, which contains methods that control what happen on individual routes
$controller = new Controller();

// If we have a match on /api/v1/images then continue
if (preg_match('/(images)/', $_SERVER["REQUEST_URI"])) {

	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		echo $controller->imagesAction($_GET);
	} else {
		http_response_code(405);
		die();
	}

} else {

	// otherwise route doesn't exist. Throw 404
	http_response_code(404);
	die();
}