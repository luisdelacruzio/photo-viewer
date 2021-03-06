<?php

namespace PhotoViewer\Api\V1;

use GuzzleHttp\Exception\GuzzleException;

class Images {

	// arbitrarily limit to number of image urls per page
	const IMAGE_URLS_PER_PAGE = 6;

	/**
	 * Retrieves a CSV containing a list of image URLS, parses it, then returns the results
	 * based on the given constraints ( pagination, toggle grayscale )
	 *
	 * @param int   $paged            The page number to return
	 * @param bool  $toggleGrayScale  Whether or not to toggle grayscale on the the images
	 * @param array $filterDimensions Optional width and height from which to filter the images by
	 *
	 * @return false|string The JSON response, or false on failure
	 */
	public function get($paged, $toggleGrayScale, $filterDimensions = []) {

		try {

			$client = new \GuzzleHttp\Client();

			$response = $client->request( 'GET', 'https://pastebin.com/raw/BmA8B0tY' );

		} catch ( GuzzleException $e ) {
			return json_encode([
				'error' => $e->getMessage()
			]);
		}

		$paginated_image_urls = self::parseCSV($response->getBody()->getContents(), $filterDimensions);

		if($toggleGrayScale) {
			$paginated_image_urls[$paged] = $this->toggleGrayScale($paginated_image_urls[$paged]);
		}

		$response = [
			'page'       => (int) $paged,
			'last_page'  => count($paginated_image_urls) - 1, // subtract one since our page nums are 0 indexed
			'image_urls' => $paginated_image_urls[$paged],
			'filter-dimensions' => $filterDimensions
		];

		return json_encode($response);
	}


	/**
	 * Parses the body of our given CSV ( new-line separated string in this case ) and
	 * transforms it into a paginated array list
	 *
	 * @param string $str              The CSV content
	 * @param array  $filterDimensions Optional width and height from which to filter the images by
	 *
	 * @return array paginated array list
	 */
	static private function parseCSV($str, $filterDimensions) {

		$image_urls = explode("\r\n", $str);

		if(!empty($filterDimensions)) {

			$width = $filterDimensions[0];
			$height = $filterDimensions[1];

			$results = [];

			foreach ($image_urls as $url) {

				$result = $url;

				if($width > -1) {
					preg_match('/(?<=\/)+\d+(?=\/+\d+$)/', $url, $matches, PREG_UNMATCHED_AS_NULL);

					if(!is_null($matches)) {
						if($matches[0] != $width) {
							$result = false;
						}
					}
				}

				if($height > -1) {
					preg_match('/(?<=\/)\d+$/', $url, $matches, PREG_UNMATCHED_AS_NULL);

					if (!is_null($matches)) {

						if($matches[0] != $height) {
							$result = false;
						}
					}
				}

				if($result !== false) {
					$results[] = $result;
				}
			}

			$image_urls = $results;
		}


		return array_chunk($image_urls, self::IMAGE_URLS_PER_PAGE);
	}


	/**
	 * Toggles grayscale on a given list of images
	 *
	 * @param array $list       The list of image URLs to toggle
	 *
	 * @return array The updated list of URLs
	 */
	private function toggleGrayScale($list) {

		foreach ($list as &$url) {

			if(strpos($url, '?grayscale') === false) {
				$url .= '?grayscale';
			} else {
				$url = str_replace('?grayscale', '', $url);
			}
		}

		return $list;
	}
}