import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot, hydrateNormalReactRoot } from '../../utils'
import { createPluginHost, createSharedContext } from '../../plugin-infra/host'
import { Services } from '../service'
import { status } from '../../setup.ui'
import Popups from './UI'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { TssCacheProvider } from '@masknet/theme'
import { currentPersonaIdentifier } from '../../settings/settings'
import { setInitialPersonaInformation } from './pages/Personas/hooks/PersonaContextInitialData'

if (location.hash === '#/personas') {
    async function hydrate() {
        console.time('[SSR] Fill data')
        await Promise.all([
            status,
            currentPersonaIdentifier.readyPromise,
            Services.Identity.queryOwnedPersonaInformation(false).then(setInitialPersonaInformation),
        ])
        console.timeEnd('[SSR] Fill data')

        const muiCache = createCache({ key: 'css' })
        const tssCache = createCache({ key: 'tss' })
        hydrateNormalReactRoot(
            <CacheProvider value={muiCache}>
                <TssCacheProvider value={tssCache}>
                    <Popups />
                </TssCacheProvider>
            </CacheProvider>,
        )
        setTimeout(startPluginHost, 200)
        console.timeEnd('[SSR] Hydrate')
    }
    hydrate()
} else {
    status.then(() => createNormalReactRoot(<Popups />)).then(startPluginHost)
}

function startPluginHost() {
    // TODO: Should only load plugins when the page is plugin-aware.

    startPluginDashboard(createPluginHost(undefined, createSharedContext))
}
