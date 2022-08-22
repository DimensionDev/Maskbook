import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { PluginId } from '@masknet/plugin-infra'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'
import { useCurrentPersonaConnectStatus } from '../../../../components/DataSource/usePersonaConnectStatus'
import { NFTAvatarDialog } from '../../../../plugins/Avatar/Application/NFTAvatarsDialog'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { startWatch, createReactRootShadowed, useLocationChange } from '../../../../utils'
import { searchEditProfileSelector } from '../../utils/selector'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchEditProfileSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginBottom: number
    border: string
    color: string
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginBottom: props.marginBottom,
        marginTop: 1,
        marginRight: theme.spacing(2),
        border: props.border,
    },
    text: {
        color: props.color,
    },
}))

export function openNFTAvatarSettingDialog() {
    const editDom = searchEditProfileSelector().evaluate()
    editDom?.click()
}

function OpenNFTAvatarEditProfileButtonInTwitter() {
    const [style, setStyle] = useState<StyleProps>({
        minHeight: 32,
        fontSize: 14,
        marginBottom: 11,
        border: 'none',
        color: '',
    })
    const [open, setOpen] = useState(false)

    const { value: personaConnectStatus, loading: personaConnectStatusLoading } = useCurrentPersonaConnectStatus()

    const setStyleFromEditProfileSelector = () => {
        const editDom = searchEditProfileSelector().evaluate()
        if (!editDom) return

        const css = window.getComputedStyle(editDom)
        const spanCss = window.getComputedStyle(editDom.querySelector('span')!)
        setStyle({
            minHeight: Number(css.minHeight.replace('px', '')),
            fontSize: Number(css.fontSize.replace('px', '')),
            marginBottom: Number(css.marginBottom.replace('px', '')),
            border: css.border,
            color: spanCss.color,
        })
    }

    useEffect(() => setStyleFromEditProfileSelector(), [])

    useLocationChange(() => setStyleFromEditProfileSelector())

    const { classes } = useStyles(style)
    return (
        <>
            {!personaConnectStatusLoading && (
                <NFTAvatarButton
                    classes={{ root: classes.root, text: classes.text }}
                    onClick={() => personaConnectStatus.action?.(PluginId.Avatar)}
                />
            )}
            <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
