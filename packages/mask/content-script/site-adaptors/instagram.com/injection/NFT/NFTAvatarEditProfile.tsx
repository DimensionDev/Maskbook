import { useMemo } from 'react'
import { useLocation } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { MaskMessages } from '@masknet/shared-base'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    searchInstagramAvatarSettingDialog,
    searchInstagramProfileAvatarButtonSelector,
    searchInstagramProfileEditButton,
} from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { NFTAvatarSettingDialog } from './NFTAvatarSettingDialog.js'

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
        borderRadius: '4px !important',
        height: 30,
        width: 134,
    },
    text: {
        fontSize: 12,
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
