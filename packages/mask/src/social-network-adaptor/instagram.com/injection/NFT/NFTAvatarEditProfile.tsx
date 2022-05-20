import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import {
    searchInstagramAvatarSettingDialog,
    searchInstagramProfileAvatarButtonSelector,
    searchInstagramProfileEditButton,
} from '../../utils/selector'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { NFTAvatarSettingDialog } from './NFTAvatarSettingDialog'
import { useLocation } from 'react-use'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramProfileAvatarButtonSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInInstagram />,
    )

    const dialogWatcher = new MutationObserverWatcher(searchInstagramAvatarSettingDialog())
    startWatch(dialogWatcher, signal)
    createReactRootShadowed(dialogWatcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarSettingDialog />)
}

const useStyles = makeStyles()(() => ({
    root: {
        marginTop: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: '#262626',
        borderRadius: '4px !important',
        height: 30,
        width: 104,
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

    return <NFTAvatarButton onClick={openNFTAvatarSettingDialog} classes={classes} />
}
