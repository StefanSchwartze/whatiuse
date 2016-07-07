var through = require('mississippi').through
var debug = require('debug')('doiuse:prune')

var slice = require('./source-slice')

module.exports = function () { return through.obj(pruneFeatureUsage) }

function pruneFeatureUsage (usageInfo, enc, next) {
  usageInfo.featureData = usageInfo.featureData || {}

  // `source` provided by postcss includes `content`, `start`, and `end`.
  // We just want the slice between start and end.
  var source = usageInfo.usage && usageInfo.usage.source
  if (source && source.input && source.input.css) {
    var s = slice(source.input.css, source.start, source.end).trim()
  }
  if (s && s.trim().length > 0) {
    source.content = s
  } else {
    source = false
  }

  var data = {
    message: usageInfo.message,
    error: usageInfo.error,
    feature: usageInfo.feature,
    title: usageInfo.featureData.title,
    source: source
  }

  // not ideal: manually parsing the human-readable string of (selected)
  // browsers that are missing support for this feature (e.g. "IE (8, 9)").
  if (usageInfo.featureData.missing) {
    var missing = usageInfo.featureData.missing.match(/[^\(]*\([^\)]*\),?/g)
    if(missing) {
      missing = missing.map(function (s) {
        var v = s.indexOf('(')
        return {
          browser: s.slice(0, v),
          versions: s.slice(v)
        }
      })
      data.missing = missing;
    }
  }
  if (usageInfo.featureData.partial) {
    var partial = usageInfo.featureData.partial.match(/[^\(]*\([^\)]*\),?/g)
    if(partial) {
      partial = partial.map(function (s) {
        var v = s.indexOf('(')
        return {
          browser: s.slice(0, v),
          versions: s.slice(v)
        }
      })
      data.partial = partial;
    }
  }
  
  debug('usage', data)
  next(null, data)
}
