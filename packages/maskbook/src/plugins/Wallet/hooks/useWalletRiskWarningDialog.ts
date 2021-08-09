import { useEffect, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../messages'

export const useWalletRiskWarningDialog = () => {
    const account = useAccount()
    const [confirmed, setConfirmed] = useState(false)

    const fetchRiskWarningStatus = () =>
        WalletRPC.getRiskWarningConfirmed(account).then((confirmed) => setConfirmed(confirmed ?? false))

    const { openDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
        fetchRiskWarningStatus,
    )

    useEffect(() => {
        if (!account) setConfirmed(false)
        else fetchRiskWarningStatus()
    }, [account])

    return { isConfirmed: confirmed, openDialog }
}
