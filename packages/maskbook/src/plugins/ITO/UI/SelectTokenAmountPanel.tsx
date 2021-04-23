import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { TokenAmountPanel, TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'
import type { ERC20TokenDetailed, NativeTokenDetailed } from '../../../web3/types'
import type { FixedTokenListProps } from '../../../extension/options-page/DashboardComponents/FixedTokenList'

export interface SelectTokenAmountPanelProps {
    amount: string
    balance: string
    token?: NativeTokenDetailed | ERC20TokenDetailed
    disableEther?: boolean
    disableSearchBar?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: NativeTokenDetailed | ERC20TokenDetailed) => void
    FixedTokenListProps?: Partial<FixedTokenListProps>
    TokenAmountPanelProps?: Partial<TokenAmountPanelProps>
}

export function SelectTokenAmountPanel(props: SelectTokenAmountPanelProps) {
    const {
        amount,
        balance,
        token,
        disableEther = false,
        disableSearchBar = false,
        onAmountChange,
        onTokenChange,
        FixedTokenListProps,
        TokenAmountPanelProps,
    } = props

    //#region select token
    const [id] = useState(uuid())
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                onTokenChange(ev.token)
            },
            [id, onTokenChange],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableEther,
            disableSearchBar,
            FixedTokenListProps,
        })
    }, [id, disableEther, disableSearchBar, FixedTokenListProps])
    //#endregion

    return (
        <TokenAmountPanel
            amount={amount}
            balance={balance}
            token={token}
            label="Amount"
            onAmountChange={onAmountChange}
            {...TokenAmountPanelProps}
            SelectTokenChip={{
                ...TokenAmountPanelProps?.SelectTokenChip,
                ChipProps: {
                    ...TokenAmountPanelProps?.SelectTokenChip?.ChipProps,
                    onClick: onSelectTokenChipClick,
                },
            }}
        />
    )
}
