import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles, startWatch } from '@masknet/theme'
import { useMemo, useState } from 'react'
import { useCurrentVisitingIdentity, useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/index.js'
import { ButtonStyle } from '../../constant.js'
import { profileFollowButtonSelector as selector } from '../../utils/selector.js'

export function injectOpenTipsButtonOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { signal }).render(<ProfileTipsSlot />)
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
    const themeSettings = useThemeSettings()
    const buttonStyle = ButtonStyle[themeSettings.size]
    const { classes, cx } = useStyles({ size: buttonStyle.buttonSize, marginBottom: buttonStyle.marginBottom })
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
                iconSize={buttonStyle.iconSize}
                buttonSize={buttonStyle.buttonSize}
                onStatusUpdate={setDisabled}
            />
        )
    }, [visitingPersona.identifier, buttonStyle.buttonSize, buttonStyle.iconSize])

    if (!component || !visitingPersona.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
