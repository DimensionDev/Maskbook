import './styles/index.css'
import './setup/locale.js'

import { setupBuildInfo } from '@masknet/flags/build-info'
import { doInitWallet } from './setup/wallet.js'
import renderApp from './render.js'

async function startApp() {
    await Promise.allSettled([doInitWallet(), setupBuildInfo()])
    renderApp()
}

startApp()
