import './fetch.js'
import './debugger.js'
import './async-setup.js'

await import(/* webpackMode: 'eager' */ './post-async-setup.js')
