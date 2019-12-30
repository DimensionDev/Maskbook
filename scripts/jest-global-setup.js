module.exports = async () => {
    await require('util').promisify(addAsmCryptoForTest)()
}

function addAsmCryptoForTest(cb) {
    var download = function(url, dest, cb) {
        var file = fs.createWriteStream(dest)
        var request = http.get(url, function(response) {
            response.pipe(file)
            file.on('finish', function() {
                file.close(cb)
            })
        })
    }

    const http = require('https')
    const fs = require('fs')

    const dist = require('path').join(__dirname, '../npm-debug.log.asmcrypto.js')
    if (fs.existsSync(dist) && fs.readFileSync(dist, 'utf-8').length > 200) return cb()
    // Jesus, but at least it will only run it test env
    // See https://github.com/PeculiarVentures/webcrypto-liner/issues/47
    download('https://peculiarventures.github.io/pv-webcrypto-tests/src/asmcrypto.js', dist, () => {
        fs.writeFileSync(dist, fs.readFileSync(dist, 'utf-8').replace('({},this);', '({},globalThis);'))
        load()
    })

    function load(err) {
        if (err) console.log(err)
        cb(err)
    }
}
