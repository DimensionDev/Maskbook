/// <reference types="@masknet/global-types/web-extension" />

import '../../setup.ui.js'
await import(/* webpackMode:'eager' */ '../../site-adaptors/browser-action/index.js')
await import(/* webpackMode: 'eager' */ './render.js')
