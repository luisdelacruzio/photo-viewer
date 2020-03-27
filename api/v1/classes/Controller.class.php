<?php

namespace PhotoViewer\Api\V1;

class Controller {

	/**
	 * Handles the response to the Images route.
	 *
	 * Checks if query params were passed to the route, then conditionally includes the params
	 * in the request for images.
	 *
	 * @param array The GET params
	 *
	 * @Route "/api/v1/images"
	 * @return false|string The JSON encoded response, or false on failure.
	 */
	public function imagesAction($queryParams) {

		$images = new Images();

		// default
		$paged = 0;
		$toggleGrayscale = false;
		$filterDimensions = [];

		// check if 'paged' query param exists and all chars are digits
		if(array_key_exists('paged', $queryParams)) {

			if(filter_var($queryParams['paged'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]) !== false) {
				$paged = $queryParams['paged'];
			}
		}

		// toggle grayscale if it exists and value set to true
		if(array_key_exists('toggle-grayscale', $queryParams)) {

			if($queryParams['toggle-grayscale'] === 'true') {
				$toggleGrayscale = true;
			}
		}

		if(array_key_exists('filter-dimensions', $queryParams)) {

			$dimensions = explode(',', $queryParams['filter-dimensions']);

			foreach ($dimensions as &$dimension) {

				if(filter_var($dimension, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) === false) {
					$dimension = -1;
				} else {
					$dimension = (int)$dimension;
				}
			}

			$filterDimensions = $dimensions;
		}

		return $images->get($paged, $toggleGrayscale, $filterDimensions);
	}
}