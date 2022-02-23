import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarSelector, searchInstagramAvatarSettingDialog } from '../../utils/selector'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { NFTAvatarSettingDialog } from './NFTAvatarSettingDialog'
import { useLocation } from 'react-use'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarSelector().closest<HTMLDivElement>(3))
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
        marginTop: 8,
        marginLeft: 'auto',
        marginRight: 'auto',

        background: '#262626',
        borderRadius: '2px !important',
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

    return (
        <>
            <NFTAvatarButton onClick={onClick} classes={classes} />
        </>
    )
}
