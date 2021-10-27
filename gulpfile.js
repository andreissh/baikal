const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const gcmq = require('gulp-group-css-media-queries');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');

const ROOT_PATH = {
    DIST: 'dist',
    PROJECT: 'src',
};

const path = {
    dist: {
        base: `${ROOT_PATH.DIST}/`,
        html: `${ROOT_PATH.DIST}/`,
        css: `${ROOT_PATH.DIST}/css/`,
        js: `${ROOT_PATH.DIST}/js/`,
        fonts: `${ROOT_PATH.DIST}/fonts/`,
        img: `${ROOT_PATH.DIST}/img/`,
    },
    src: {
        base: `${ROOT_PATH.PROJECT}/`,
        html: `${ROOT_PATH.PROJECT}/*.html`,
        css: `${ROOT_PATH.PROJECT}/styles/main.scss`,
        styles: `${ROOT_PATH.PROJECT}/styles/**/*.scss`,
        js: `${ROOT_PATH.PROJECT}/js/**/*.js`,
        fonts: `${ROOT_PATH.PROJECT}/fonts/**/*.{woff,ttf}`,
        img: `${ROOT_PATH.PROJECT}/img/**/*.{png,jpg,svg,gif,webp}`,
    },
};

const cleanTask = () => del(path.dist.base);

const htmlTask = () => {
    let result;

     result = src(path.src.html)
        .pipe(webphtml())
        .pipe(dest(path.dist.html));

    return result;
};

const cssTask = () => {
    let result;

    result = src(path.src.css)
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowsers: ['last 3 versions']
        }))
        .pipe(gcmq())
        .pipe(cleanCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(dest(path.dist.css));

    return result;
};

const jsTask = () => src(path.src.js)
    .pipe(terser())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(path.dist.js));

const imgTask = () => {
    let result;

    result = src(path.src.img)
        .pipe(webp({
            quality: 70,
        }))
        .pipe(dest(path.dist.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false,
            }],
            interlaced: true, 
            optimizationLevel: 3,
        }))
        .pipe(dest(path.dist.img));

    return result;
};

const fontsTask = () => src(path.src.fonts)
    .pipe(dest(path.dist.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff())
    .pipe(dest(path.dist.fonts))
    .pipe(src(path.src.fonts))
    .pipe(ttf2woff2())
    .pipe(dest(path.dist.fonts));

const serveTask = (done) => {
    browserSync.init({
        server: {
            baseDir: path.dist.base,
        },
    }, done);
};

const liveReload = (done) => {
    browserSync.reload();
    done();
};

const watchFilesTask = (done) => {
        watch(path.src.css, series(cssTask, liveReload));
        watch(path.src.styles, series(cssTask, liveReload));
        watch(path.src.html, series(htmlTask, liveReload));
        watch(path.src.js, series(jsTask, liveReload));
        watch(path.src.fonts, series(fontsTask, liveReload));
        watch(path.src.img, series(imgTask, liveReload));
    
    done();
};

exports.default = series(
    cleanTask,
    series(htmlTask, cssTask, jsTask, fontsTask, imgTask),
    serveTask,
    watchFilesTask,
);

exports.build = series(
    cleanTask,
    series(htmlTask, cssTask, jsTask, fontsTask, imgTask),
);