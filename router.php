<?php


if (preg_match('/\.(?:png|jpg|jpeg|gif|js|css|map)$/', $_SERVER["REQUEST_URI"])) {
	// serve the requested resource as-is.
	return false;
} elseif(preg_match('/^\/api\/v1\/.*/', $_SERVER["REQUEST_URI"])) {
	// return api router if /api/v1/* is matched
	require 'api/v1/apiRouter.php';
} elseif(preg_match('/(^\/$)|(^\/\?.*)/', $_SERVER["REQUEST_URI"])) {
	// return the homepage if "/" or "/?*" is matched
	require 'web/index.html';
} else {
	http_response_code(404);
	die;
}