const REDACTED = '[REDACTED]';

/**
 * Redacts tokens and sensitive data from strings, headers, or objects.
 *
 * @param {unknown} value
 * @param {string} [tokenToMask]
 * @returns {unknown}
 */
export function redactSecrets(value, tokenToMask) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    let sanitized = value.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, `Bearer ${REDACTED}`);
    sanitized = sanitized.replace(/([?&]token=)[^&]+/gi, `$1${REDACTED}`);
    if (tokenToMask && tokenToMask.length > 3) {
      sanitized = sanitized.replaceAll(tokenToMask, REDACTED);
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item, tokenToMask));
  }

  if (typeof value === 'object') {
    const copy = {};
    for (const [k, v] of Object.entries(value)) {
      const lowerKey = k.toLowerCase();
      if (
        lowerKey.includes('authorization') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password')
      ) {
        copy[k] = REDACTED;
      } else if (v instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(v))) {
        copy[k] = `[Binary data: ${v.byteLength || v.length} bytes]`;
      } else {
        copy[k] = redactSecrets(v, tokenToMask);
      }
    }
    return copy;
  }

  return value;
}

/**
 * Creates a safe logger that masks tokens and credentials.
 *
 * @param {object} [customLogger]
 * @param {string} [token]
 * @returns {object}
 */
export function createLogger(customLogger, token) {
  if (!customLogger) {
    return {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  }

  const wrap = (level) => {
    const fn = customLogger[level] || customLogger.log || (() => {});
    return (...args) => {
      try {
        const sanitizedArgs = args.map((arg) => redactSecrets(arg, token));
        fn.apply(customLogger, sanitizedArgs);
      } catch (_e) {
        // Logging should never throw and disrupt core SDK operations
      }
    };
  };

  return {
    debug: wrap('debug'),
    info: wrap('info'),
    warn: wrap('warn'),
    error: wrap('error'),
  };
}
