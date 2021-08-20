import { useEffect, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../messages'

export const useWalletRiskWarningDialog = () => {
    const account = useAccount()
    const [isConfirmed, setIsConfirmed] = useState(false)

    const fetchRiskWarningStatus = () => {
        if (!account) setIsConfirmed(false)
        else WalletRPC.getRiskWarningConfirmed(account).then((confirmed) => setIsConfirmed(confirmed ?? false))
    }

    const { openDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
        fetchRiskWarningStatus,
    )

    useEffect(fetchRiskWarningStatus, [account])

    return { isConfirmed, openDialog }
}
