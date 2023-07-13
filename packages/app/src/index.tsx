import './styles/index.css'
import './locales/init.js'

import { setupBuildInfo } from '@masknet/flags/build-info'
await setupBuildInfo()

await import(/* webpackMode: 'eager' */ './render.js')
