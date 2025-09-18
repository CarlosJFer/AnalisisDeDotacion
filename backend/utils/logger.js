// Simple logger with levels: error, warn, info, debug
// Controls output via LOG_LEVEL env var. Defaults to 'warn' to keep console clean.

const LEVELS = { silent: -1, error: 0, warn: 1, info: 2, debug: 3 };

const levelName = (process.env.LOG_LEVEL || '').toLowerCase();
const currentLevel = Object.prototype.hasOwnProperty.call(LEVELS, levelName)
  ? LEVELS[levelName]
  : LEVELS.warn; // default: only warnings and errors

function logIf(minLevel, fn, args) {
  if (currentLevel >= minLevel) {
    try {
      fn(...args);
    } catch (_) {
      // ignore logging errors
    }
  }
}

module.exports = {
  debug: (...args) => logIf(LEVELS.debug, console.debug, args),
  info: (...args) => logIf(LEVELS.info, console.info, args),
  warn: (...args) => logIf(LEVELS.warn, console.warn, args),
  error: (...args) => logIf(LEVELS.error, console.error, args),
};

