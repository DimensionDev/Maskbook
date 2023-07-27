import { useMemo } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    createInjectHooksRenderer,
    Plugin,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
} from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, PluginID, NetworkPluginID, type SocialAccount } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3ContextProvider, useWeb3Others, useNetworkContext } from '@masknet/web3-hooks-base'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { menuAuthorSelector as selector } from '../../utils/selectors.js'
import { startWatch } from '../../../../utils/startWatch.js'

export function injectTipsButtonOnMenu(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <AuthorTipsButtonWrapper />
        </Web3ContextProvider>,
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
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Others()

    const accounts = useMemo((): Array<SocialAccount<Web3Helper.ChainIdAll>> => {
        if (!visitingIdentity?.identifier) return EMPTY_LIST
        return [
            {
                pluginID,
                address: visitingIdentity.identifier.userId,
                label: visitingIdentity.nickname
                    ? `(${visitingIdentity.nickname}) ${Others.formatAddress(visitingIdentity.identifier.userId, 4)}`
                    : visitingIdentity.identifier.userId,
            },
        ]
    }, [visitingIdentity, Others.formatAddress])

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return (
            <Component
                identity={visitingIdentity.identifier}
                slot={Plugin.SNSAdaptor.TipsSlot.MirrorMenu}
                accounts={accounts}
            />
        )
    }, [visitingIdentity.identifier, accounts])

    if (!component || !visitingIdentity.identifier || isMinimal) return null

    return <span className={classes.root}>{component}</span>
}
