import { memo, useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { useFungibleTokenPrice, useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { SelectTokenChipProps } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatEtherToWei } from '@masknet/web3-shared-evm'
import { InputTokenPanelUI } from './components/InputTokenPanelUI.js'

interface InputTokenPanelProps extends withClasses<'root'> {
    balance: string
    amount: string
    chainId: Web3Helper.ChainIdAll
    maxAmount: string
    token?: Web3Helper.FungibleTokenAll | null
    onAmountChange: (amount: string) => void
    SelectTokenChip?: Partial<SelectTokenChipProps>
    isAvailableBalance?: boolean
}

export const InputTokenPanel = memo<InputTokenPanelProps>(
    ({
         chainId,
         token,
         balance,
         onAmountChange,
         amount,
         SelectTokenChip: SelectTokenChipProps,
         maxAmount,
         isAvailableBalance,
     }) => {
        const { pluginID } = useNetworkContext()
        const Utils = useWeb3Utils()
        const { data: tokenPrice = 0 } = useFungibleTokenPrice(pluginID, token?.address?.toLowerCase())

        const tokenValueUSD = useMemo(
            () => (amount ? new BigNumber(amount).times(tokenPrice).toString() : '0'),
            [amount, tokenPrice],
        )

        return (
            <InputTokenPanelUI
                isAvailableBalance={isAvailableBalance}
                balance={Utils.isNativeTokenAddress(token?.address) ? formatEtherToWei(maxAmount).toString() : balance}
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

InputTokenPanel.displayName = 'InputTokenPanel'
