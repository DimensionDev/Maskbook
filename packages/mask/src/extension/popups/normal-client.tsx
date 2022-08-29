import { status } from '../../setup.ui'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot, hydrateNormalReactRoot } from '../../utils'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host'
import { Services } from '../service'
import Popups from './UI'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { TssCacheProvider } from '@masknet/theme'
import { currentPersonaIdentifier } from '../../../shared/legacy-settings/settings'
import { setInitialPersonaInformation } from './pages/Personas/hooks/PersonaContextInitialData'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui'

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

        /**
         * Firefox will not help popup fixed width when user click browser action
         * So this will determine if the user has set maxWidth to 'unset' when resizing in the window
         */
        if (process.env.engine === 'firefox') {
            setTimeout(() => {
                document.body.style.maxWidth = '350px'

                window.addEventListener(
                    'resize',
                    () => {
                        if (window.innerWidth !== 350) {
                            document.body.style.maxWidth = 'unset'
                        }
                    },
                    { once: true },
                )
            }, 200)
        }
        console.timeEnd('[SSR] Hydrate')
    }
    hydrate()
} else {
    status.then(() => createNormalReactRoot(<Popups />)).then(startPluginHost)
}

function startPluginHost() {
    // TODO: Should only load plugins when the page is plugin-aware.

    startPluginDashboard(
        createPluginHost(
            undefined,
            (id, signal) => ({
                ...createPartialSharedUIContext(id, signal),
                ...RestPartOfPluginUIContextShared,
            }),
            Services.Settings.getPluginMinimalModeEnabled,
        ),
    )
}
