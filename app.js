require('dotenv').config();
const express = require('express');
const path = require('path');
const chalk = require('chalk');
const hbs = require('hbs');
const morgan = require('morgan');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mainRouter = require('./routes/main');

app.use('/', mainRouter);

app.listen(process.env.PORT, () => {
  console.log(chalk.green('-- Server is up! --'));
});
