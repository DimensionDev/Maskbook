import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { useMemo, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { TwitterStyle, useButtonStyles } from '../../constant.js'
import { profileFollowButtonSelector as selector } from '../../utils/selector.js'

export function injectOpenTipsButtonOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<ProfileTipsSlot />)
}

interface StyleProps {
    size: number
    marginBottom: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    hide: {
        display: 'none',
    },
    slot: {
        position: 'relative',
        height: props.size,
        width: props.size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        marginRight: theme.spacing(1),
        marginBottom: props.marginBottom,
        verticalAlign: 'top',
    },
}))

function ProfileTipsSlot() {
    const visitingPersona = useCurrentVisitingIdentity()
    const buttonStyles: TwitterStyle = useButtonStyles()
    const { classes, cx } = useStyles({ size: buttonStyles.buttonSize, marginBottom: buttonStyles.marginBottom })
    const [disabled, setDisabled] = useState(true)

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return (
            <Component
                identity={visitingPersona.identifier}
                slot={Plugin.SNSAdaptor.TipsSlot.Profile}
                iconSize={buttonStyles.iconSize}
                buttonSize={buttonStyles.buttonSize}
                onStatusUpdate={setDisabled}
            />
        )
    }, [visitingPersona.identifier, buttonStyles.buttonSize, buttonStyles.iconSize])

    if (!component || !visitingPersona.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
