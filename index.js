;
var http  = require('follow-redirects').http
  , https = require('follow-redirects').https
  , fs    = require('fs')
  , util  = require('util')
  , join  = require('path').join
  , argv  = require('minimist')(process.argv.slice(2))
  , mixcloud = require('mixcloud')

var args = require('minimist')(process.argv.slice(2))
  , fs_path = './podcasts'
  , user = args._.length ? args._.shift() : ''
  , podcasts = args._

if (podcasts.length > 0) {

  //Info
  console.log('\nPlease wait for all downloads to complete..' +
              '\n(this can take several minutes, depending on connection speed)' +
              '\n\nprocessing: '+ user, podcasts)

  podcasts.forEach(function(podcast_id) {

    var streamer_id = parseInt(14 + Math.random() * 9)
      , str_prefix  = 'https://stream'
      , str_suffix  = '.mixcloud.com/c/m4a/64'
      , stream_host = str_prefix + streamer_id + str_suffix

    //Request
    var url = 'https://www.mixcloud.com/'+ user +'/'+ podcast_id
    https.get(url, function(res) {
      var body = ''
      res.setEncoding('utf8')
      res.on('data', function(chunk) {
        body += chunk
      })
      res.on('error', function(err) {
        console.error('Network error:', err.message)
      })
      res.on('end', function() {

        //Parse
        var re  = /\<div class=\"cloudcast-waveform\" m-waveform=\"(.*?)\.json"\>\<\/div\>/g
          , m = body.match(re)

	if (m !== null && m[0]) {
          var url = m[0].substring(73, m[0].length - 13)
          url = stream_host + url +'.m4a'

          var p = mixcloud.cloudcast(user, podcast_id)
          p.then(function(obj) {

	    //Download
            var title = obj.name +'.m4a'
            console.log('downloading >>', fs_path +'/'+ title)
            https.get(url, function(res) {
              res.pipe(fs.createWriteStream(join(fs_path, title)))
            })
          })
          p.catch(function(err) {
            console.error(err.message, err.stack)
          })
	}

      })
    })

  })

}
