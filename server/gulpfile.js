let gulp  = require('gulp')
let nodemon    = require('gulp-nodemon')

gulp.task('default', function () {
  return nodemon({
    script: './src/app.js',
    ext: 'js json',
    legacyWatch: true
  })
})
