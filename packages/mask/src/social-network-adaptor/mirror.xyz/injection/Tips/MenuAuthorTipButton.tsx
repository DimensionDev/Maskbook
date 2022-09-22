import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { menuAuthorSelector as selector } from '../../utils/selectors.js'

export function injectTipsButtonOnMenu(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<AuthorTipsSlot />)
}

const useStyles = makeStyles()((theme) => ({
    slot: {
        position: 'relative',
        marginLeft: '0.5rem',
        height: 40,
        width: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.mode === 'dark' ? '#536471' : '#d2dbe0',
        borderRadius: 999,
        marginRight: theme.spacing(1),
        verticalAlign: 'top',
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,243,244,0.1)' : 'rgba(15,20,25,0.1)',
        },
    },
}))

function AuthorTipsSlot() {
    const visitingPersona = useCurrentVisitingIdentity()
    const { classes } = useStyles()
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return <Component identity={visitingPersona.identifier} slot={Plugin.SNSAdaptor.TipsSlot.MirrorMenu} />
    }, [visitingPersona.identifier])

    if (!component || !visitingPersona.identifier) return null

    return <span className={classes.slot}>{component}</span>
}
