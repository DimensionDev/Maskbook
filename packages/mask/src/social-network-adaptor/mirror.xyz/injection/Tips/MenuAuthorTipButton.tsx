import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    createInjectHooksRenderer,
    Plugin,
    PluginID,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
} from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { menuAuthorSelector as selector } from '../../utils/selectors.js'

export function injectTipsButtonOnMenu(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<AuthorTipsButtonWrapper />)
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
    const visitingPersona = useCurrentVisitingIdentity()
    const isMinimal = useIsMinimalMode(PluginID.Tips)
    const { classes } = useStyles()

    const tipsAccounts = useMemo(() => {
        if (!visitingPersona?.identifier) return []
        return [
            {
                address: visitingPersona.identifier.userId,
                name: visitingPersona.nickname,
            },
        ]
    }, [visitingPersona])

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return (
            <Component
                identity={visitingPersona.identifier}
                slot={Plugin.SNSAdaptor.TipsSlot.MirrorMenu}
                tipsAccounts={tipsAccounts}
            />
        )
    }, [visitingPersona.identifier])

    if (!component || !visitingPersona.identifier || isMinimal) return null

    return <span className={classes.root}>{component}</span>
}
