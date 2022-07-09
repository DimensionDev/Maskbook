import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'
import { Trans } from 'react-i18next'
import { useNextIDConnectStatus } from '../../../../components/DataSource/useNextID'
import { usePersonaConnectStatus } from '../../../../components/DataSource/usePersonaConnectStatus'
import { NFTAvatarDialog } from '../../../../plugins/Avatar/Application/NFTAvatarsDialog'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { startWatch, createReactRootShadowed, useLocationChange, useI18N } from '../../../../utils'
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
    const { t } = useI18N()
    const personaConnectStatus = usePersonaConnectStatus()
    const nextIDConnectStatus = useNextIDConnectStatus()

    const createOrConnectPersona = useCallback(() => {
        personaConnectStatus.action?.()
    }, [personaConnectStatus])

    const verifyPersona = useCallback(() => {
        nextIDConnectStatus.reset()
    }, [nextIDConnectStatus])

    const clickHandler = () => {
        if (!personaConnectStatus.hasPersona || !personaConnectStatus.connected) return createOrConnectPersona()
        if (!nextIDConnectStatus.isVerified) return verifyPersona()
        setOpen(true)
        return
    }

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
                tooltip={
                    !personaConnectStatus.hasPersona || !personaConnectStatus.connected ? (
                        t('application_tooltip_hint_create_persona')
                    ) : !nextIDConnectStatus.isVerified ? (
                        t('application_tooltip_hint_connect_persona')
                    ) : (
                        <Trans i18nKey="application_hint" />
                    )
                }
                classes={{ root: classes.root, text: classes.text }}
                onClick={clickHandler}
            />
            <NFTAvatarDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
