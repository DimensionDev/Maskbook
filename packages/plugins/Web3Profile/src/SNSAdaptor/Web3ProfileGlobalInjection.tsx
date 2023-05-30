import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainContextProvider } from '@masknet/web3-hooks-base'
import { Sentry } from '@masknet/web3-providers'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'
import { memo, useEffect, useState } from 'react'
import { FollowLensDialog } from './components/FollowLensDialog.js'
import { LensPopup } from './components/LensPopup.js'
import { Web3ProfileDialogWrapper } from './components/Web3ProfileDialog.js'
import { context } from './context.js'

export const Web3ProfileGlobalInjection = memo(function Web3ProfileGlobalInjection() {
    const [profileOpen, setProfileOpen] = useState(false)
    useEffect(() => {
        return CrossIsolationMessages.events.web3ProfileDialogEvent.on(({ open }) => {
            setProfileOpen(open)
            if (open)
                Sentry.captureEvent({
                    eventType: TelemetryAPI.EventType.Access,
                    eventID: TelemetryAPI.EventID.AccessWeb3ProfileDialog,
                })
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
        <SNSAdaptorContext.Provider value={context}>
            {profileOpen ? <Web3ProfileDialogWrapper open onClose={() => setProfileOpen(false)} /> : null}

            {lensOpen && handle ? (
                <ChainContextProvider value={{ chainId: ChainId.Matic }}>
                    <FollowLensDialog handle={handle} onClose={closeLensDialog} />
                </ChainContextProvider>
            ) : null}

            <LensPopup />
        </SNSAdaptorContext.Provider>
    )
})
