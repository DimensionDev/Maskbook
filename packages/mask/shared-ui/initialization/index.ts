import './fetch.js'
import './debugger.js'
import './async-setup.js'
import './report-x-token.js'

await import(/* webpackMode: 'eager' */ './post-async-setup.js')
