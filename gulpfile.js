'use strict';
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('default', function() {
  nodemon({
    script: './server/server.js',
    ext: 'js',
    env: {
			// PORT: 8001,
      env: false,
			// DB_CONNECTION_STRING : "mongodb://localhost:3223232/govinda-dev"
    },
    ignore: ['./node_modules/**'],
  }).on('restart', function() {
    console.log('Restarted');
  });
});
