class PhotoAlbum {

    /**
     * Init the PhotoAlbum class. On init, create the photo album
     */
    constructor() {
        this.container = document.getElementById('album-container');
        this.el = null;
        this.route = '/api/v1/images';
        this.shouldToggleGrayScale = false;
        this.lastPage = null;
        this.currPage = null;
        this.filterDimensions = [];

        let albumParams = {};

        let currPagination = PhotoAlbum.getCurrPagination();

        // if we aren't on the first page, then get the image results of the current page
        if(currPagination !== false) {
            albumParams['paged'] = currPagination;
        }

        let currFilterDimensions = PhotoAlbum.getCurrFilterDimensions();

        if(currFilterDimensions !== false) {
            albumParams['filter-dimensions'] = currFilterDimensions;

            if(currFilterDimensions[0] > -1) {
                document.getElementById('width').value = currFilterDimensions[0];
            }

            if(currFilterDimensions[1] > -1) {
                document.getElementById('height').value = currFilterDimensions[1];
            }
        }

        // request the images and create the gallery
        this.requestImages(albumParams);

        document.getElementById('toggle-grayscale').addEventListener('click', () => this.toggleGrayScale());
        document.getElementById('filter').addEventListener('click', () => this.filterImages());
    }

    /**
     * Requests the images, then add an event listener to fire once the request
     * has been received.
     *
     * @param {object|null} params  The potential params "paged" or "toggle-grayscale"
     */
    requestImages(params = null) {

        const request = new XMLHttpRequest();

        // once we receive the response, create a new album, add to the DOM, and
        // update pagination
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {

                let responseBody = JSON.parse(request.response);

                this.lastPage = responseBody['last_page'];
                this.currPage = responseBody['page'];
                this.filterDimensions = responseBody['filter-dimensions'];

                this.create(responseBody['image_urls']);
                this.updatePaginationButtons();
            }
        }.bind(this);

        let queryParams = PhotoAlbum.generateQueryParams(params);

        request.open('GET', this.route + queryParams);
        request.setRequestHeader('Cache-Control', 'max-age=3600');
        request.send();
    }

    /**
     * Constructs a query param string that can be appended to the API call
     *
     * e.g "?paged=4&toggle-grayscale=true"
     *
     * @param {object} params The params to add to the query string
     * @returns {string} The query param string
     */
    static generateQueryParams(params) {

        if(params == null || typeof params !== "object") {
            return "";
        }

        let paramsStr = [];

        if (params['paged'] != null && typeof params['paged'] === "number") {
            paramsStr.push(`paged=${params['paged']}`);
        }

        if (params['toggle-grayscale'] != null && params['toggle-grayscale']) {
            paramsStr.push(`toggle-grayscale=${params['toggle-grayscale']}`);
        }

        if (params['filter-dimensions'] != null && params['filter-dimensions'].length > 0) {
            paramsStr.push(`filter-dimensions=${params['filter-dimensions']}`);
        }

        let resultingStr = "";

        for (let i = 0; i < paramsStr.length; i++) {

            resultingStr += (i === 0) ? `?${paramsStr[i]}` : `&${paramsStr[i]}`;
        }
        
        return resultingStr;
    }

    /**
     * Given a list of URLs, construct the HTML for the photo album
     *
     * @param {array} images The image URLs
     */
    create(images) {

        let row = document.createElement('DIV');
        row.classList.add('row');

        if(images !== null) {
            for(let i = 0; i < images.length; i++) {

                let col = document.createElement('DIV');
                col.classList.add('col');

                let img = document.createElement('IMG');
                img.src = images[i];

                col.appendChild(img);
                row.appendChild(col);
            }
        }

        if(this.el !== null) {
            this.container.replaceChild(row, this.el);
        } else {
            this.container.appendChild(row);
        }

        this.el = row;
    }

    /**
     * Toggles gray scale
     */
    toggleGrayScale() {

        // keep track of the toggle state
        this.shouldToggleGrayScale = !this.shouldToggleGrayScale;

        let requestParams = {
            'toggle-grayscale': this.shouldToggleGrayScale,
            'paged': this.currPage
        };

        if(this.filterDimensions.length !== 0) {
            requestParams['filter-dimensions'] = this.filterDimensions;
        }

        this.requestImages(requestParams);
    }

    /**
     * Updates the pagination buttons
     */
    updatePaginationButtons() {

        let nextPaginationButton = document.getElementById('next-page');
        let prevPaginationButton = document.getElementById('prev-page');

        if (this.currPage < this.lastPage) {

            nextPaginationButton.classList.remove('d-none');
            nextPaginationButton.href = `/?paged=${this.currPage + 1}`;

            if(this.filterDimensions.length > 0) {
                nextPaginationButton.href += `&filter-dimensions=${this.filterDimensions}`;
            }

        } else {
            if(!nextPaginationButton.classList.contains('d-none')) {
                nextPaginationButton.classList.add('d-none');
            }
        }

        if(this.currPage > 0) {

            prevPaginationButton.classList.remove('d-none');
            prevPaginationButton.href = `/?paged=${this.currPage - 1}`;

            if(this.filterDimensions.length > 0) {
                prevPaginationButton.href += `&filter-dimensions=${this.filterDimensions}`;
            }
        } else {
            if(!prevPaginationButton.classList.contains('d-none')) {
                prevPaginationButton.classList.add('d-none');
            }
        }
    }

    /**
     * The current "paged" number
     *
     * @returns {int|boolean} The curr page number; false if "paged" param non-existent
     */
    static getCurrPagination() {

        const urlParams = new URLSearchParams(window.location.search);

        if(urlParams.has('paged')) {

            let pageNum = parseInt(urlParams.get('paged'));

            if(isNaN(pageNum)) {
                return false;
            } else {
                return pageNum;
            }
        }

        return false;
    }

    /**
     * The current dimensions by which to filter the images by
     *
     * @returns {array|boolean} filter dimensions or false if no filter
     */
    static getCurrFilterDimensions() {

        const urlParams = new URLSearchParams(window.location.search);

        if(urlParams.has('filter-dimensions')) {

            let filterDimensions = urlParams.get('filter-dimensions').split(',');

            for (let i = 0; i < filterDimensions.length; i++) {
                let size = parseInt(filterDimensions[i]);

                if(isNaN(size)) {
                    filterDimensions[i] = -1;
                } else {
                    filterDimensions[i] = size;
                }
            }

            return filterDimensions;
        }

        return false;
    }


    /**
     * Filter images by dimensions
     */
    filterImages() {

        // get the value of the width and height. Floor the results if user
        // entered float.
        let width = parseInt(document.getElementById('width').value);
        let height = parseInt(document.getElementById('height').value);

        if(isNaN(width)) {
            width = -1;
        }

        if(isNaN(height)) {
            height = -1;
        }

        this.requestImages({
            'filter-dimensions': [width, height]
        });

    }
}