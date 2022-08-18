import { memo, useMemo } from 'react'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useFungibleTokenPrice } from '@masknet/plugin-infra/web3'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { InputTokenPanelUI } from './components/InputTokenPanelUI'
import type { SelectTokenChipProps } from '@masknet/shared'

export interface InputTokenPanelProps extends withClasses<'root'> {
    balance: string
    amount: string
    chainId: ChainId
    maxAmount: string
    token?: FungibleToken<ChainId, SchemaType> | null
    onAmountChange: (amount: string) => void
    SelectTokenChip?: Partial<SelectTokenChipProps>
}

export const InputTokenPanel = memo<InputTokenPanelProps>(
    ({ chainId, token, balance, onAmountChange, amount, SelectTokenChip: SelectTokenChipProps, maxAmount }) => {
        const { value: tokenPrice = 0 } = useFungibleTokenPrice(
            NetworkPluginID.PLUGIN_EVM,
            token?.address.toLowerCase(),
            { chainId },
        )

        const tokenValueUSD = useMemo(
            () => (amount ? new BigNumber(amount).times(tokenPrice).toFixed(2) : '0'),
            [amount, tokenPrice],
        )

        return (
            <InputTokenPanelUI
                balance={balance}
                token={token}
                amount={amount}
                chainId={chainId}
                maxAmount={maxAmount}
                onAmountChange={onAmountChange}
                tokenValueUSD={tokenValueUSD}
                SelectTokenChip={SelectTokenChipProps}
            />
        )
    },
)
