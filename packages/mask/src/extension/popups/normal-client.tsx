import { startPluginDashboard } from '@masknet/plugin-infra'
import { createNormalReactRoot, hydrateNormalReactRoot } from '../../utils'
import { createPluginHost } from '../../plugin-infra/host'
import { Services } from '../service'
import { status } from '../../setup.ui'
import Popups from './UI'
import { InMemoryStorages, PersistentStorages } from '../../../shared/kv-storage'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { TssCacheProvider } from '@masknet/theme'
import { initData } from './pages/Personas/hooks/usePersonaContext'

if (location.hash === '#/personas') {
    async function hydrate() {
        await Promise.all([
            Services.Identity.queryCurrentPersona().then((x) => (initData.currentIdentifier = x?.toText())),
            Services.Identity.queryOwnedPersonaInformation().then((x) => (initData.personas = x)),
            Services.Identity.queryOwnedProfileInformationWithNextID().then((x) => (initData.profiles = x)),
            status,
        ])

        const muiCache = createCache({ key: 'css' })
        const tssCache = createCache({ key: 'tss' })
        hydrateNormalReactRoot(
            <CacheProvider value={muiCache}>
                <TssCacheProvider value={tssCache}>
                    <Popups />
                </TssCacheProvider>
            </CacheProvider>,
        )
        startPluginHost()
        import('./pages/Wallet')
        console.timeEnd('[SSR] Hydrate')
    }
    hydrate()
} else {
    status.then(() => createNormalReactRoot(<Popups />)).then(startPluginHost)
}

function startPluginHost() {
    // TODO: Should only load plugins when the page is plugin-aware.
    startPluginDashboard(
        createPluginHost(undefined, (pluginID, signal) => {
            return {
                createKVStorage(type, defaultValues) {
                    if (type === 'memory')
                        return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                    else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                },
                personaSign: Services.Identity.signWithPersona,
                walletSign: Services.Ethereum.personalSign,
            }
        }),
    )
}
