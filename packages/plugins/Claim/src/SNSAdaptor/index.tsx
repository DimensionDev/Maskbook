import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { PluginClaimMessage } from '../message.js'
import { ClaimDialog } from './components/ClaimDialog/index.js'
import { ClaimEntry } from './components/ClaimEntry/index.js'
import { ClaimSuccessDialog } from './components/ClaimSuccessDialog/index.js'
import { context, setupContext } from './context.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
    GlobalInjection: function ClaimGlobalInjection() {
        const { open: claimOpen, closeDialog: closeClaimDialog } = useRemoteControlledDialog(
            PluginClaimMessage.claimDialogEvent,
        )

        const [tokenAddress, setTokenAddress] = useState<string>()
        const [amount, setAmount] = useState<string>()
        const { open: successOpen, closeDialog: closeSuccessDialog } = useRemoteControlledDialog(
            PluginClaimMessage.claimSuccessDialogEvent,
            (ev) => {
                if (!ev.open) {
                    setAmount(undefined)
                    setTokenAddress(undefined)
                    return
                }

                setAmount(ev.amount)

                if (isValidAddress(ev.token)) setTokenAddress(ev.token)
            },
        )

        return (
            <SNSAdaptorContext.Provider value={context}>
                {claimOpen ? <ClaimDialog open onClose={closeClaimDialog} /> : null}
                {successOpen ? (
                    <ClaimSuccessDialog open onClose={closeSuccessDialog} tokenAddress={tokenAddress} amount={amount} />
                ) : null}
            </SNSAdaptorContext.Provider>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent: (props) => {
                return <ClaimEntry {...props} />
            },
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 8,
            icon: <Icons.MarketsClaim size={36} />,
            name: <Trans ns={PluginID.Claim} i18nKey="__plugin_name" />,
            iconFilterColor: 'rgba(240, 51, 51, 0.3)',
            category: 'dapp',
            entryWalletConnectedNotRequired: true,
        },
    ],
}

export default sns
