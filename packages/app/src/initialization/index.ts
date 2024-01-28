import '@masknet/polyfill/dist/ecmascript.js'
import '../styles/index.css'

import { setupBuildInfo } from '@masknet/flags/build-info'
import { startBackgroundWorker } from './message.js'
import { timeout } from '@masknet/kit'

async function initApp() {
    await setupBuildInfo()
    const background = timeout(
        startBackgroundWorker(),
        3000,
        'Background worker timed out, please check out chrome://inspect/#workers. Please refresh the page, SharedWorker has been temporarily set to non-shared for debug purpose.',
    )
    background.catch(() => {
        sessionStorage.setItem('background-worker-failed', 'true')
    })
    await background

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
