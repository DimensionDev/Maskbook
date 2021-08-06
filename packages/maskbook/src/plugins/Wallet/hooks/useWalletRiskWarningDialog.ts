import { useEffect, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../messages'
import { useAccount } from '@masknet/web3-shared'
import { getRiskWarningStatus, RiskWaringStatus } from '../services'

export const useWalletRiskWarningDialog = () => {
    const account = useAccount()
    const [status, setStatus] = useState<RiskWaringStatus>()

    const fetchRiskWarningStatus = () =>
        getRiskWarningStatus(account).then((status) => setStatus(status ?? RiskWaringStatus.Unset))

    const { openDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletRiskWarningDialogUpdated,
        fetchRiskWarningStatus,
    )

    useEffect(() => {
        if (!account) {
            setStatus(RiskWaringStatus.Unset)
        } else {
            fetchRiskWarningStatus()
        }
    }, [account])

    return { isConfirmed: status === RiskWaringStatus.Confirmed, openDialog }
}
