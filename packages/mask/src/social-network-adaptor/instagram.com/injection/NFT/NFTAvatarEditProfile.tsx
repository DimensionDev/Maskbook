import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    searchInstagramAvatarSettingDialog,
    searchInstagramProfileAvatarButtonSelector,
    searchInstagramProfileEditButton,
} from '../../utils/selector.js'
import { attachReactTreeWithContainer, MaskMessages, startWatch } from '../../../../utils/index.js'
import { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { NFTAvatarSettingDialog } from './NFTAvatarSettingDialog.js'
import { useLocation } from 'react-use'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramProfileAvatarButtonSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInInstagram />,
    )

    const dialogWatcher = new MutationObserverWatcher(searchInstagramAvatarSettingDialog())
    startWatch(dialogWatcher, signal)
    attachReactTreeWithContainer(dialogWatcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarSettingDialog />)
}

const useStyles = makeStyles()(() => ({
    root: {
        marginTop: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: '#262626',
        borderRadius: '4px !important',
        height: 30,
        width: 134,
    },
    text: {
        fontSize: 12,
        color: '#ffffff',
        lineHeight: '12px',
    },
}))

export function openNFTAvatarSettingDialog() {
    MaskMessages.events.nftAvatarSettingDialogUpdated.sendToLocal({ open: true })
}

function OpenNFTAvatarEditProfileButtonInInstagram() {
    const location = useLocation()

    const { classes } = useStyles()

    const editButton = useMemo(() => searchInstagramProfileEditButton().evaluate(), [location.pathname])

    if (location.pathname?.includes('/edit') || !editButton) return null

    return (
        <NFTAvatarButton
            onClick={openNFTAvatarSettingDialog}
            classes={{
                root: classes.root,
                text: classes.text,
            }}
        />
    )
}
