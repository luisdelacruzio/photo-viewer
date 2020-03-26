<?php

namespace PhotoViewer\Api\V1;

class Controller {

	/**
	 * Handles the response to the Images route.
	 *
	 * Checks if query params were passed to the route, then conditionally includes the params
	 * in the request for images.
	 *
	 * @Route "/api/v1/images"
	 * @return false|string The JSON encoded response, or false on failure.
	 */
	public function imagesAction() {

		$images = new Images();

		// default
		$paged = 0;
		$toggleGrayscale = false;

		// check if 'paged' query param exists and all chars are digits
		if(array_key_exists('paged', $_GET) && ctype_digit($_GET['paged'])) {
			$paged = $_GET['paged'];
		}

		// toggle grayscale if it exists and value set to true
		if(array_key_exists('toggle-grayscale', $_GET)) {

			if($_GET['toggle-grayscale'] === 'true') {
				$toggleGrayscale = true;
			}
		}

		return $images->get($paged, $toggleGrayscale);
	}
}