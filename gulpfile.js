var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    ''
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function () {
    //UI Router
    gulp.src([
        './node_modules/@uirouter/angularjs/release/angular-ui-router.js'
    ])
        .pipe(gulp.dest('./app/vendor/@uirouter'))
    //Angular smart-table
    gulp.src([
        './node_modules/angular-smart-table/dist/smart-table.js'
    ])
        .pipe(gulp.dest('./app/vendor/angular-smart-table'))
    //Angular Spinner
    gulp.src([
        './node_modules/angular-spinner/dist/angular-spinner.js'
    ])
        .pipe(gulp.dest('./app/vendor/angular-spinner'))
    //d3
    gulp.src([
        './node_modules/d3/build/d3.js'
    ])
        .pipe(gulp.dest('./app/vendor/d3'))
    //d3-cloud
    gulp.src([
        './node_modules/d3-cloud/build/d3.layout.cloud.js'
    ])
        .pipe(gulp.dest('./app/vendor/d3-cloud'))
    //Angular d3 word
    gulp.src([
        './node_modules/angular-d3-word-cloud/dist/angular-word-cloud.js'
    ])
        .pipe(gulp.dest('./app/vendor/angular-d3-word-cloud'))
    //Angular
    gulp.src([
        './node_modules/angular/angular.min.js'
    ])
        .pipe(gulp.dest('./app/vendor/angular'))

    // Bootstrap
    gulp.src([
        './node_modules/bootstrap/dist/**/*',
        '!./node_modules/bootstrap/dis./app/css/bootstrap-grid*',
        '!./node_modules/bootstrap/dis./app/css/bootstrap-reboot*'
    ])
        .pipe(gulp.dest('./app/vendor/bootstrap'))

    // Font Awesome
    gulp.src([
        './node_modules/font-awesome/**/*',
        '!./node_modules/font-awesome/{less,less/*}',
        '!./node_modules/font-awesome/{scss,scss/*}',
        '!./node_modules/font-awesome/.*',
        '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
        .pipe(gulp.dest('./app/vendor/font-awesome'))

    // jQuery
    gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./app/vendor/jquery'))

    // jQuery Easing
    gulp.src([
        './node_modules/jquery.easing/*.js'
    ])
        .pipe(gulp.dest('./app/vendor/jquery-easing'))

    // Magnific Popup
    gulp.src([
        './node_modules/magnific-popup/dist/*'
    ])
        .pipe(gulp.dest('./app/vendor/magnific-popup'))

});

// Compile SCSS
gulp.task('css:compile', function () {
    return gulp.src('./app/scss/**/*.scss')
        .pipe(sass.sync({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./app/css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function () {
    return gulp.src([
        './app/css/*.css',
        '!./app/css/*.min.css'
    ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function () {
    return gulp.src([
        './app/js/*.js',
        '!./app/js/*.min.js'
    ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./app/js'))
        .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['css', 'js', 'vendor']);

// Configure the browserSync task
gulp.task('browserSync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000", // port of node server
        port: 3003
    });
});

// Dev task
gulp.task('dev', ['css', 'js', 'browserSync'], function () {
    gulp.watch('./app/scss/*.scss', ['css']);
    gulp.watch('./app/js/appjs/*.js', ['js']);
    gulp.watch('./app/*.html', browserSync.reload);
});

gulp.task('nodemon', function (cb) {
    var callbackCalled = false;
    return nodemon({
        script: './bin/www',
        watch: [
            "routes/"
        ],
        nodeArgs: ['--inspect']
    }).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            cb();
        }
    });
});