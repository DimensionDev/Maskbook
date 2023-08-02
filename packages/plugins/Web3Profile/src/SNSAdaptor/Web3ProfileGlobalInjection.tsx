import { memo, useEffect, useState } from 'react'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { Sentry } from '@masknet/web3-telemetry'
import { ChainId } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { LensPopup } from './components/LensPopup.js'
import { FollowLensDialog } from './components/FollowLensDialog.js'
import { Web3ProfileDialog } from './components/Web3ProfileDialog.js'
import { context } from './context.js'

export const Web3ProfileGlobalInjection = memo(function Web3ProfileGlobalInjection() {
    const [profileOpen, setProfileOpen] = useState(false)
    useEffect(() => {
        return CrossIsolationMessages.events.web3ProfileDialogEvent.on(({ open }) => {
            setProfileOpen(open)
            if (open)
                Sentry.captureEvent({
                    eventType: EventType.Access,
                    eventID: EventID.AccessWeb3ProfileDialog,
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
            {profileOpen ? <Web3ProfileDialog open onClose={() => setProfileOpen(false)} /> : null}

            {lensOpen && handle ? (
                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Matic }}>
                    <FollowLensDialog handle={handle} onClose={closeLensDialog} />
                </Web3ContextProvider>
            ) : null}

            <LensPopup />
        </SNSAdaptorContext.Provider>
    )
})
