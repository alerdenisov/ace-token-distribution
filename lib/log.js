const chalk = require('chalk')

function _normalize(str, length) {
  if (str.length > length) {
    return str.substr(0, length)
  }

  while(str.length < length) {
    str += ' '
  }

  return str
}

function _log ({channel, type, message}) {
  channel = _normalize(channel, 3)
  type    = _normalize(type, 5)

  console.log(`[${channel} ${type}]: ${message}`)
}

module.exports = {
  verb: function(message) {
    return
    return _log({ channel: 'ACE', type: 'VERB', message })
  },
  err: function(message) {
    return _log({ channel: 'ACE', type: 'ERROR', message })
  },
  info: function(message) {
    return _log({ channel: 'ACE', type: 'INFO', message })
  },
  war: function(message) {
    return _log({ channel: 'ACE', type: 'WARNING', message })
  }
}