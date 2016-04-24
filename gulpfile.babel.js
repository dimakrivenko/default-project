'use strict';

import plugins from 'gulp-load-plugins';
import yargs from 'yargs';
import browser from 'browser-sync';
import gulp from 'gulp';
import panini from 'panini';
import rimraf from 'rimraf';
import sherpa from 'style-sherpa';
import yaml from 'js-yaml';
import fs from 'fs';
import pxtorem from 'postcss-pxtorem'; // px в rem
import inlineSvg from 'postcss-inline-svg'; // svg в data:image
import pngquant from 'imagemin-pngquant'; // сжатие png
import mqpacker from 'css-mqpacker'; // сгруппированные media query
import opacity from 'postcss-opacity'; // сгруппированные media query
import assets from 'postcss-assets'; // пути до файлов



// Загружаем Gulp плагины в одной переменной
const $ = plugins();

// Флаг для компиляции в продакшн --production 
const PRODUCTION = !!(yargs.argv.production);

// Загружаем настройки из settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

// Компиляция в папку "dist" без отслеживания изменений 
gulp.task('build',
    gulp.series(clean, gulp.parallel(pages, sass, javascript, images, copy), styleGuide));

// Компиляция в папку "dist" с отслеживанием изменений в файлах
gulp.task('default',
    gulp.series('build', server, watch));

// Удаляем папку "dist", это присходит каждый раз при компиляции 
function clean(done) {
    rimraf(PATHS.dist, done);
}

// Копируем файлы из папки "assets", папки "img", "js", "scss" - НЕ КОПИРУЮТСЯ
function copy() {
    return gulp.src(PATHS.assets)
        .pipe(gulp.dest(PATHS.dist + '/assets'));
}

// Компиляция HTML шаблонов 
function pages() {
    return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
            root: 'src/pages/',
            layouts: 'src/layouts/',
            partials: 'src/partials/',
            data: 'src/data/',
            helpers: 'src/helpers/'
        }))
        .pipe(gulp.dest(PATHS.dist));
}

// Обновление шаблонов через шаблонизатор Panini
function resetPages(done) {
    panini.refresh();
    done();
}

// Генерация Styleguide
function styleGuide(done) {
    sherpa('src/styleguide/index.md', {
        output: PATHS.dist + '/styleguide.html',
        template: 'src/styleguide/template.html'
    }, done);
}

// Компиляция SCSS
function sass() {
    var processors = [
        pxtorem(),
        inlineSvg(),
        mqpacker(),
        opacity(),
        assets({
            loadPaths: ['src/assets/img/'],
            relativeTo: 'src/assets/scss/'
        })
    ]
    return gulp.src('src/assets/scss/main.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
                includePaths: PATHS.sass
            })
            .on('error', $.sass.logError))
        .pipe($.postcss(processors))
        .pipe($.autoprefixer({ browsers: COMPATIBILITY }))
        .pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
        .pipe($.if(PRODUCTION, $.cssnano()))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/css'))
        .pipe(browser.reload({ stream: true }));
}

// Компиляция JavaScript
function javascript() {
    return gulp.src(PATHS.javascript)
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('main.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Компиляция изображений в "dist"
function images() {
    return gulp.src('src/assets/img/**/*')
        .pipe($.if(PRODUCTION, $.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            use: [pngquant({quality: '50-65', speed: 4})],
        })))
        .pipe(gulp.dest(PATHS.dist + '/assets/img'));
}

// Запуск сервера
function server(done) {
    browser.init({
        server: PATHS.dist,
        port: PORT
    });
    done();
}

// Отслеживание изменений в файлах
function watch() {
    gulp.watch(PATHS.assets, copy);
    gulp.watch('src/pages/**/*.html', gulp.series(pages, browser.reload));
    gulp.watch('src/{layouts,partials}/**/*.html', gulp.series(resetPages, pages, browser.reload));
    gulp.watch('src/assets/scss/**/*.scss', sass);
    gulp.watch('src/assets/js/**/*.js', gulp.series(javascript, browser.reload));
    gulp.watch('src/assets/img/**/*', gulp.series(images, browser.reload));
    gulp.watch('src/styleguide/**', gulp.series(styleGuide, browser.reload));
}
