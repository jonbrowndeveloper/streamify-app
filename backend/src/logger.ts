import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'error', // Log only errors
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: '../monitor/logs/backend.log', maxsize: 5242880, maxFiles: 5 })
  ]
});

export default logger;