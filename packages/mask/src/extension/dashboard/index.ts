import { status } from '../../setup.ui.js'
await status
await import(/* webpackMode: 'eager' */ './post-init.js')
