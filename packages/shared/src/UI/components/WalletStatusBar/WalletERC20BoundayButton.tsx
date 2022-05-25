import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { useSharedI18N } from '../../../locales'
import { ERC20Bounday, WalletButton } from './WalletBarButton'

interface WalletERC20BoundayButtonProps extends withClasses<'root'> {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    color: 'warning'
    loading?: boolean
    disabled?: boolean
    action?: () => void
    title?: string | React.ReactElement | React.ReactNode
    boundary?: ERC20Bounday
}

export function WalletERC20BoundayButton(props: WalletERC20BoundayButtonProps) {
    const { boundary } = props
    const t = useSharedI18N()
    const [{ type: approveStateType, allowance }, transactionState, approveCallback, resetApproveCallback] =
        useERC20TokenApproveCallback(boundary?.token?.address ?? '', boundary?.amount, boundary?.spender)

    const onApprove = useCallback(
        async (useExact = false) => {
            if (approveStateType !== ApproveStateType.NOT_APPROVED) return
            await approveCallback(useExact)
        },
        [approveStateType, transactionState, approveCallback],
    )

    if (!boundary?.token) return <WalletButton {...props} />

    if (approveStateType === ApproveStateType.UNKNOWN)
        return <WalletButton {...props} disabled title="Enter an amount" />
    if (approveStateType === ApproveStateType.FAILED)
        return (
            <WalletButton
                {...props}
                title={t.wallet_load_retry({ symbol: boundary?.token.symbol ?? boundary?.token.name ?? 'Token' })}
                action={resetApproveCallback}
            />
        )
    if (approveStateType === ApproveStateType.PENDING || approveStateType === ApproveStateType.UPDATING)
        return (
            <WalletButton
                {...props}
                title={
                    approveStateType === ApproveStateType.PENDING
                        ? t.plugin_ito_unlocking_symbol({ symbol: boundary.token.symbol ?? '' })
                        : `Updating ${boundary.token.symbol}`
                }
                loading={approveStateType === ApproveStateType.PENDING}
                action={resetApproveCallback}
                disabled
            />
        )
    return <WalletButton {...props} />
}
