import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarSettingDialog, searchInstagramProfileAvatarButtonSelector } from '../../utils/selector'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { useCallback } from 'react'
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

function OpenNFTAvatarEditProfileButtonInInstagram() {
    const location = useLocation()
    const onClick = useCallback(() => {
        MaskMessages.events.nftAvatarSettingDialogUpdated.sendToLocal({ open: true })
    }, [])

    const { classes } = useStyles()

    if (location.pathname?.includes('/edit')) return null

    return <NFTAvatarButton onClick={onClick} classes={classes} />
}
