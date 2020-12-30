const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {sequelize} = require('./models');
const indexRouter = require('./routes/index');

sequelize.sync({ alter : false})
.then(() => {
  console.log('데이터베이스 연결 성공');
})
.catch((error) => {
  console.error(error);
})

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/', indexRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const port = 3000;
app.listen(port, ()=> console.log(`app listening on port ${port}!`));