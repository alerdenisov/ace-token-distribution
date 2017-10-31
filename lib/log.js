import debug from 'debug'

const channels = {

}

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
  if (!channels[channel]) {
    channels[channel] = {}
  }

  if (!channels[channel][type]) {
    channels[channel][type] = debug(`${channel}:${type}`)
  }

  channels[channel][type](message)
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