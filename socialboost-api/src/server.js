const { config } = require('./config');
const { createApp } = require('./app');
const logger = require('./logger');

const server = createApp().listen(config.port, () => {
  logger.info('server_started', { port: config.port, env: config.nodeEnv, model: config.ollamaModel });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error('port_in_use', {
      port: config.port,
      hint: `Another process is already using port ${config.port}. Stop it or start with PORT=${config.port + 1}.`
    });
    process.exit(1);
  }

  logger.error('server_error', { error: error.message });
  process.exit(1);
});

function shutdown(signal) {
  logger.info('server_shutdown_started', { signal });
  server.close(() => {
    logger.info('server_shutdown_completed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.warn('server_shutdown_forced');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { server };
