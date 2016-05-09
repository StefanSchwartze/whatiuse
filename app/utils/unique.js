var through = require('mississippi').through

module.exports = function unique () {
  var used = {}
  var uniq = {
    counts: through.obj(),
    features: through.obj(function (usage, enc, next) {
      if (usage.feature && used[usage.feature]++) return next()
      if (usage.feature) used[usage.feature] = 1
      next(null, usage)
    },
      function end (next) {
        uniq.counts.end(JSON.stringify(used))
        uniq.ended = true
        this.push(null)
        next()
      })
  }
  return uniq
}
