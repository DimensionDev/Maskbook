import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ERC20TokenListProps, useRemoteControlledDialog } from '@masknet/shared'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { TokenAmountPanel, TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'

export interface SelectTokenAmountPanelProps {
    amount: string
    balance: string
    token?: FungibleTokenDetailed
    disableNativeToken?: boolean
    disableSearchBar?: boolean
    onAmountChange: (amount: string) => void
    onTokenChange: (token: FungibleTokenDetailed) => void
    FungibleTokenListProps?: Partial<ERC20TokenListProps>
    TokenAmountPanelProps?: Partial<TokenAmountPanelProps>
}

export function SelectTokenAmountPanel(props: SelectTokenAmountPanelProps) {
    const {
        amount,
        balance,
        token,
        disableNativeToken = false,
        disableSearchBar = false,
        onAmountChange,
        onTokenChange,
        FungibleTokenListProps,
        TokenAmountPanelProps,
    } = props

    //#region select token
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
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
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken,
            disableSearchBar,
            FungibleTokenListProps,
        })
    }, [id, disableNativeToken, disableSearchBar, FungibleTokenListProps])
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
