import { useState } from 'react'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { WalletRiskWarning } from './WalletRiskWarning.js'

export interface WalletRiskWarningModalOpenProps {
    account: string
}

export function WalletRiskWarningModal({ ref }: SingletonModalProps<WalletRiskWarningModalOpenProps>) {
    const [account, setAccount] = useState('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setAccount(props.account)
        },
    })

    if (!open) return null
    return <WalletRiskWarning account={account} open onClose={() => dispatch?.close()} />
}
