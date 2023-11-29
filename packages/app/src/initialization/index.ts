import '@masknet/polyfill/dist/ecmascript.js'
import '../styles/index.css'

import { setupBuildInfo } from '@masknet/flags/build-info'
import { startBackgroundWorker } from './message.js'

async function initApp() {
    await setupBuildInfo()
    await startBackgroundWorker()

    await Promise.all([
        import(/* webpackMode: 'eager' */ './fetch-flag.js').then(({ initFetchFlags }) => initFetchFlags()),
        import(/* webpackMode: 'eager' */ './storage.js').then(({ initStorage }) => initStorage()),
        import(/* webpackMode: 'eager' */ './wallet.js').then(({ initWallet }) => initWallet()),
        import(/* webpackMode: 'eager' */ './locale.js').then(({ initLocale }) => initLocale()),
        import(/* webpackMode: 'eager' */ './queryClient.js').then(({ initQueryClient }) => initQueryClient()),
    ])

    await import(/* webpackMode: 'eager' */ '../render.js').then(({ renderApp }) => renderApp())
}

initApp()
