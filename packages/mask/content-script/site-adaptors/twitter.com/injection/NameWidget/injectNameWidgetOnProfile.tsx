import { memo, useMemo, useState } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { startWatch } from '../../../../utils/startWatch.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelector } from '../../utils/selector.js'

const useStyles = makeStyles()((theme) => ({
    hide: {
        display: 'none',
    },
    slot: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        marginLeft: theme.spacing(0.5),
        verticalAlign: 'top',
    },
}))

const ProfileNameWidgetSlot = memo(function ProfileNameWidgetSlot() {
    const visitingIdentity = useCurrentVisitingIdentity()
    const [disabled, setDisabled] = useState(true)
    const { classes, cx } = useStyles()

    const userId = visitingIdentity.identifier?.userId
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.NameWidget?.UI?.Content,
        )

        return (
            <Component
                userId={userId}
                slot={Plugin.SiteAdaptor.NameWidgetSlot.ProfileName}
                onStatusUpdate={setDisabled}
            />
        )
    }, [userId])

    if (!component || !userId) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
})

function selector() {
    return querySelector<HTMLElement>('[data-testid=UserName] div[dir]')
}

export function injectNameWidgetProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileNameWidgetSlot />)
}
