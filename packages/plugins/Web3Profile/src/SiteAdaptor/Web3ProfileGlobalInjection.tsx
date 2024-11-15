import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { memo, useEffect, useState } from 'react'
import { FollowLensDialog } from './components/Lens/FollowLensDialog.js'
import { SocialPopup } from './components/SocialBadges/SocialPopup.js'
import { Web3ProfileDialog } from './components/Web3ProfileDialog.js'

export const Web3ProfileGlobalInjection = memo(function Web3ProfileGlobalInjection() {
    const [profileOpen, setProfileOpen] = useState(false)
    useEffect(() => {
        return CrossIsolationMessages.events.web3ProfileDialogEvent.on(({ open }) => {
            setProfileOpen(open)
        })
    }, [])
    const [handle, setHandle] = useState('')

    const { open: lensOpen, closeDialog: closeLensDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.followLensDialogEvent,
        (ev) => {
            if (!ev.open) {
                setHandle('')
            }
            setHandle(ev.handle)
        },
    )

    return (
        <>
            {profileOpen ?
                <Web3ProfileDialog open onClose={() => setProfileOpen(false)} />
            :   null}

            {lensOpen && handle ?
                <EVMWeb3ContextProvider chainId={ChainId.Polygon}>
                    <FollowLensDialog handle={handle} onClose={closeLensDialog} />
                </EVMWeb3ContextProvider>
            :   null}

            <SocialPopup />
        </>
    )
})
