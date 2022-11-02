import { memo, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useFungibleTokenPrice, useNetworkContext } from '@masknet/web3-hooks-base'
import { InputTokenPanelUI } from './components/InputTokenPanelUI.js'
import type { SelectTokenChipProps } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'

export interface InputTokenPanelProps extends withClasses<'root'> {
    balance: string
    amount: string
    chainId: Web3Helper.ChainIdAll
    maxAmount: string
    token?: Web3Helper.FungibleTokenAll | null
    onAmountChange: (amount: string) => void
    SelectTokenChip?: Partial<SelectTokenChipProps>
}

export const InputTokenPanel = memo<InputTokenPanelProps>(
    ({ chainId, token, balance, onAmountChange, amount, SelectTokenChip: SelectTokenChipProps, maxAmount }) => {
        const { pluginID } = useNetworkContext()
        const { value: tokenPrice = 0 } = useFungibleTokenPrice(pluginID, token?.address.toLowerCase(), { chainId })

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
