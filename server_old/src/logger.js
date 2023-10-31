


// Script that handles node error messages

let winston = require('winston');

var log_levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
var log_console = 'verbose';
var log_file = 'info';
var log_socket = 'error';

const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: log_console,
        format: winston.format.combine( winston.format.timestamp(), winston.format.colorize({ all: true }), winston.format.simple() )
      }),
      new winston.transports.File({
        filename: 'logs.log',
        level: log_file,
        format: winston.format.combine( winston.format.timestamp(), winston.format.json() )
      })
    ]
  });

module.exports = {
    logger: logger
}