// Script that handles node error messages

let winston = require('winston');

var log_level:string[] = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
var log_console:string = 'verbose';
var log_file:string = 'info';
var log_socket:string = 'error';

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


export { logger };
