import './styles/index.css'
import './setup/locale.js'

import { setupBuildInfo } from '@masknet/flags/build-info'
await setupBuildInfo()

await import(/* webpackMode: 'eager' */ './render.js')
