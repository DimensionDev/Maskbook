import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox/index.js'

export interface WalletStatusDialogProps {
    closeDialog?: () => void
}
export function WalletStatusDialog(props: WalletStatusDialogProps) {
    return <WalletStatusBox showPendingTransaction closeDialog={props.closeDialog} />
}
