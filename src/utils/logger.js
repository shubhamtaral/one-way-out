const isDev = import.meta.env.DEV;

const levelOrder = ['debug', 'info', 'warn', 'error'];
const configuredLevel = (import.meta.env.VITE_LOG_LEVEL || (isDev ? 'debug' : 'warn')).toLowerCase();

function shouldLog(messageLevel) {
  return levelOrder.indexOf(messageLevel) >= levelOrder.indexOf(configuredLevel);
}

function log(method, level, args) {
  if (!shouldLog(level)) return;
  console[method](...args);
}

export const logger = {
  debug: (...args) => log('log', 'debug', args),
  info: (...args) => log('info', 'info', args),
  warn: (...args) => log('warn', 'warn', args),
  error: (...args) => log('error', 'error', args),
};

