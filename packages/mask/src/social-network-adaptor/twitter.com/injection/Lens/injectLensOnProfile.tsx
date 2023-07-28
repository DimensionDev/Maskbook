import { useMemo, useState } from 'react'
import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { startWatch } from '../../../../utils/startWatch.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelector } from '../../utils/selector.js'

const selector: () => LiveSelector<HTMLElement, true> = () =>
    querySelector<HTMLElement>('[data-testid=UserName] div[dir]')

export function injectLensOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileLensSlot />)
}

const useStyles = makeStyles()((theme) => ({
    hide: {
        display: 'none',
    },
    slot: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        marginLeft: theme.spacing(0.5),
        verticalAlign: 'top',
    },
}))

function ProfileLensSlot() {
    const visitingIdentity = useCurrentVisitingIdentity()
    const [disabled, setDisabled] = useState(true)
    const { classes, cx } = useStyles()

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.Lens?.UI?.Content,
        )

        return (
            <Component
                identity={visitingIdentity.identifier}
                slot={Plugin.SNSAdaptor.LensSlot.ProfileName}
                onStatusUpdate={setDisabled}
            />
        )
    }, [visitingIdentity.identifier])

    if (!component || !visitingIdentity.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
