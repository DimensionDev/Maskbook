import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    createInjectHooksRenderer,
    Plugin,
    PluginID,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
} from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import type { TipsAccount } from '../../../../plugins/Tips/types/tip.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { menuAuthorSelector as selector } from '../../utils/selectors.js'
import { PluginIDContextProvider, useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function injectTipsButtonOnMenu(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <AuthorTipsButtonWrapper />
        </PluginIDContextProvider>,
    )
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        marginLeft: theme.spacing(1),
        height: 40,
        width: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.maskColor.line,
        borderRadius: 20,
        marginRight: theme.spacing(1),
        color: theme.palette.text.primary,
    },
}))

function AuthorTipsButtonWrapper() {
    const { classes } = useStyles()

    const visitingIdentity = useCurrentVisitingIdentity()
    const isMinimal = useIsMinimalMode(PluginID.Tips)
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()

    const tipsAccounts = useMemo((): TipsAccount[] => {
        if (!visitingIdentity?.identifier) return EMPTY_LIST
        return [
            {
                pluginId,
                address: visitingIdentity.identifier.userId,
                name: `(${visitingIdentity.nickname}) ${Others?.formatAddress(visitingIdentity.identifier.userId, 4)}`,
            },
        ]
    }, [visitingIdentity])

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return (
            <Component
                identity={visitingIdentity.identifier}
                slot={Plugin.SNSAdaptor.TipsSlot.MirrorMenu}
                tipsAccounts={tipsAccounts}
            />
        )
    }, [visitingIdentity.identifier])

    if (!component || !visitingIdentity.identifier || isMinimal) return null

    return <span className={classes.root}>{component}</span>
}
