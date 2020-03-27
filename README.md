## Photo Viewer

This is a photo viewer web application that takes a csv file containing a list of URLs ( hardcoded to 
pull this specific csv: https://pastebin.com/raw/BmA8B0tY ) and creates a photo gallery. This web application is
comprised of a front-end gallery and back-end API. 

### prerequisites

- \>= PHP 5.4 
- [Composer](https://getcomposer.org/doc/00-intro.md)

### Getting Started

Install the project dependencies using composer
   
```bash
composer install    
```

Then, using the PHP CLI, run the project using PHP's built-in webserver:

```bash
php -S 127.0.0.1:4000 router.php
```

Note: The router script routes traffic to the correct templates and files
