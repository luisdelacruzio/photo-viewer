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

        let albumParams = null;
        let currPagination = PhotoAlbum.getCurrPagination();

        // if we aren't on the first page, then get the image results of the current page
        if(currPagination !== false) {
            albumParams = {
                'paged': currPagination
            };
        }

        // request the images and create the gallery
        this.requestImages(albumParams);

        document.getElementById('toggle-grayscale').addEventListener('click', () => this.toggleGrayScale());
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

        for(let i = 0; i < images.length; i++) {

            let col = document.createElement('DIV');
            col.classList.add('col');

            let img = document.createElement('IMG');
            img.src = images[i];

            col.appendChild(img);
            row.appendChild(col);
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

        this.requestImages({
            'toggle-grayscale': this.shouldToggleGrayScale,
            'paged': this.currPage
        });
    }

    /**
     * Updates the pagination buttons
     */
    updatePaginationButtons() {
        if (this.currPage < this.lastPage) {

            let nextPaginationButton = document.getElementById('next-page');

            nextPaginationButton.classList.remove('d-none');
            nextPaginationButton.href = `/?paged=${this.currPage + 1}`;

        }

        if(this.currPage > 0) {
            let prevPaginationButton = document.getElementById('prev-page');

            prevPaginationButton.classList.remove('d-none');
            prevPaginationButton.href = `/?paged=${this.currPage - 1}`;
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
            return parseInt(urlParams.get('paged'));
        }

        return false;
    }
}