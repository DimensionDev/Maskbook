import type { BindingProof } from '@masknet/shared-base'

export interface WalletButtonActionProps {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    color?: 'warning'
    loading?: boolean
    disabled?: boolean
    action?: () => Promise<void>
    title?: string | React.ReactElement | React.ReactNode
    waiting?: string | React.ReactElement | React.ReactNode
}
export interface WalletMenuActionProps {
    openPopupsWindow?: () => void
    haveMenu?: boolean
    onConnectWallet?: () => void
    nextIDWallets?: BindingProof[]
    pending?: string | React.ReactElement | React.ReactNode
}
