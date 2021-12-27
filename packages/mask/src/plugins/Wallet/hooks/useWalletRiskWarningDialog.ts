import { useEffect, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared-evm'
import { WalletMessages, WalletRPC } from '../messages'

export const useWalletRiskWarningDialog = () => {
    const account = useAccount()
    const [isConfirmed, setConfirmed] = useState(false)

    const fetchRiskWarningStatus = () => {
        if (!account) setConfirmed(false)
        else WalletRPC.getRiskWarningConfirmed(account).then((confirmed) => setConfirmed(confirmed ?? false))
    }

    const { openDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
        fetchRiskWarningStatus,
    )

    useEffect(fetchRiskWarningStatus, [account])

    return { isConfirmed, openDialog }
}
