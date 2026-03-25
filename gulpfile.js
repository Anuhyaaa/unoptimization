const gulp = require('gulp');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const browsersync = require('browser-sync').create();
const del = require('del');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const { execFile } = require('child_process');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  sharp = null;
}

const paths = {
  html: ['./*.html'],
  css: ['./style.css'],
  js: ['./app.js', './router.js', './theme.js', './service-worker.js', './index.js', './steps.js', './weekly.js', './water.js', './quotes.js', './profile.js', './progress.js', './settings.js', './distance.js', './user-name.js'],
  images: {
    source: ['./images/**/*.{jpg,jpeg,png,webp}'],
    convert: ['./images/**/*.{jpg,jpeg,png}']
  },
  fonts: ['./fonts/**/*.{eot,ttf}'],
  dist: './dist'
};

const clean = () => del([paths.dist]);

const html = () =>
  gulp
    .src(paths.html, { allowEmpty: true })
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true
      })
    )
    .pipe(gulp.dest(paths.dist))
    .pipe(browsersync.stream());

const css = () =>
  gulp
    .src(paths.css, { allowEmpty: true })
    .pipe(cssnano())
    .pipe(gulp.dest(paths.dist))
    .pipe(browsersync.stream());

const javascript = () =>
  gulp
    .src(paths.js, { allowEmpty: true })
    .pipe(
      babel({
        presets: ['@babel/preset-env']
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist))
    .pipe(browsersync.stream());

const copyImages = () =>
  gulp
    .src(paths.images.source, { allowEmpty: true })
    .pipe(gulp.dest(`${paths.dist}/images`));

const optimizeImages = () =>
  gulp
    .src(paths.images.source, { allowEmpty: true })
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 78, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({ plugins: [{ removeViewBox: false }] })
      ])
    )
    .pipe(gulp.dest(`${paths.dist}/images`));

const convertToWebp = () => {
  if (!sharp) {
    console.warn('sharp is not installed, skipping WebP conversion.');
    return Promise.resolve();
  }

  return gulp
    .src(paths.images.convert, { allowEmpty: true })
    .pipe(
      new Transform({
        objectMode: true,
        transform(file, _, callback) {
          if (file.isNull()) {
            callback(null, file);
            return;
          }

          if (file.isStream()) {
            callback(new Error('Streaming image files are not supported.'));
            return;
          }

          const outputName = `${path.parse(file.path).name}.webp`;

          sharp(file.contents)
            .webp({ quality: 82 })
            .toBuffer()
            .then((buffer) => {
              file.contents = buffer;
              file.path = path.join(path.dirname(file.path), outputName);
              callback(null, file);
            })
            .catch(callback);
        }
      })
    )
    .pipe(gulp.dest(`${paths.dist}/images`));
};

function collectFonts(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results = [];

  function walk(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (entry.name.endsWith('.eot') || entry.name.endsWith('.ttf')) {
        results.push(entryPath);
      }
    }
  }

  walk(directory);
  return results;
}

async function subsetFonts() {
  const fontFiles = collectFonts(path.resolve('./fonts'));

  if (!fontFiles.length) {
    return undefined;
  }

  await Promise.all(
    fontFiles.map(
      (fontFile) =>
        new Promise((resolve) => {
          const outputPath = path.join(paths.dist, 'fonts', path.basename(fontFile));
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });

          execFile(
            'pyftsubset',
            [fontFile, '--output-file', outputPath, '--layout-features=*', '--glyphs=*', '--no-hinting'],
            (error) => {
              if (error) {
                fs.copyFileSync(fontFile, outputPath);
              }
              resolve();
            }
          );
        })
    )
  );
}

const images = gulp.series(copyImages, optimizeImages, convertToWebp);

const serve = (done) => {
  browsersync.init({
    server: {
      baseDir: paths.dist
    },
    notify: false,
    online: true,
    port: 3000
  });
  done();
};

const reload = (done) => {
  browsersync.reload();
  done();
};

const watch = () => {
  gulp.watch(paths.html, gulp.series(html, reload));
  gulp.watch(paths.css, gulp.series(css, reload));
  gulp.watch(paths.js, gulp.series(javascript, reload));
  gulp.watch(paths.images.source, gulp.series(images, reload));
  gulp.watch(paths.fonts, gulp.series(subsetFonts, reload));
};

const development = gulp.series(clean, gulp.parallel(html, css, javascript, images, subsetFonts), serve, watch);
const build = gulp.series(clean, gulp.parallel(html, css, javascript, images, subsetFonts));

exports.default = development;
exports.build = build;
exports.clean = clean;
exports.css = css;
exports.js = javascript;
exports.html = html;
exports.images = images;
exports.subsetFonts = subsetFonts;
exports.watch = watch;