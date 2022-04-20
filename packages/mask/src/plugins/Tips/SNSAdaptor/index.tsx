import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { ApplicationEntry } from '@masknet/shared'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useState, useMemo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { TipsEntranceDialog } from './TipsEntranceDialog'
import { NextIDPlatform, CrossIsolationMessages } from '@masknet/shared-base'
import Services from '../../../extension/service'
import { NextIDProof } from '@masknet/web3-providers'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { currentSetupGuideStatus } from '../../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../../settings/types'
import { WalletMessages } from '../../Wallet/messages'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                const ui = activatedSocialNetworkUI
                const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
                const [open, setOpen] = useState(false)
                const lastStateRef = currentSetupGuideStatus[ui.networkIdentifier]
                const lastState_ = useValueRef(lastStateRef)
                const lastState = useMemo<SetupGuideCrossContextStatus>(() => {
                    try {
                        return JSON.parse(lastState_)
                    } catch {
                        return {}
                    }
                }, [lastState_])
                const lastRecognized = useLastRecognizedIdentity()
                const getUsername = () =>
                    lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
                const [username] = useState(getUsername)
                const { value: isBound } = useAsync(async () => {
                    const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
                    const persona = await Services.Identity.queryPersona(currentPersonaIdentifier!)
                    return NextIDProof.queryIsBound(persona.publicHexKey ?? '', platform, username)
                }, [platform, username])
                const { closeDialog } = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)

                const onNextIDVerify = useCallback(() => {
                    closeDialog()
                    CrossIsolationMessages.events.triggerSetupGuideVerifyOnNextIDStep.sendToAll({})
                }, [])

                return isBound !== undefined ? (
                    <>
                        <ApplicationEntry
                            title="Tips"
                            disabled={disabled}
                            icon={new URL('../assets/Tip.png', import.meta.url).toString()}
                            onClick={() => (!isBound ? onNextIDVerify() : setOpen(true))}
                        />
                        <TipsEntranceDialog open={open} onClose={() => setOpen(false)} />
                    </>
                ) : (
                    <></>
                )
            },
            ApplicationEntryID: base.ID,
            icon: <img src={new URL('../assets/Tip.png', import.meta.url).toString()} />,
            name: base.name,
            appBoardSortingDefaultPriority: 8,
        },
    ],
}

export default sns
