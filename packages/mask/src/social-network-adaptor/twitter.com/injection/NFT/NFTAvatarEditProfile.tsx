import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'
import { usePersonaConnectStatus } from '../../../../components/DataSource/usePersonaConnectStatus'
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

    const personaConnectStatus = usePersonaConnectStatus()

    const createOrConnectPersona = useCallback(() => {
        personaConnectStatus.action?.()
    }, [personaConnectStatus])

    const verifyPersona = useCallback(() => {
        CrossIsolationMessages.events.verifyNextID.sendToAll(undefined)
    }, [])

    const clickHandler = (() => {
        if (personaConnectStatus.hasPersona === false) return createOrConnectPersona
        if (personaConnectStatus.connected === false) return verifyPersona
        return
    })()

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
            <NFTAvatarButton
                classes={{ root: classes.root, text: classes.text }}
                onClick={clickHandler ?? (() => setOpen(true))}
            />
            <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
