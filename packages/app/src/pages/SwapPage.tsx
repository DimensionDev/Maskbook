import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { AllProviderTradeContext, Trader } from '@masknet/plugin-trader'
import { NetworkPluginID } from '@masknet/shared-base'
import { DefaultWeb3ContextProvider, useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { createERC20Token, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { PageContainer } from '../components/PageContainer.js'
import { shareToTwitterAsPopup } from '@masknet/shared-base-ui'

interface SwapPageProps {}

export default function SwapPage(props: SwapPageProps) {
    const location = useLocation()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const params = new URLSearchParams(location.search)
    const address = params.get('contract_address')
    const name = params.get('name')
    const symbol = params.get('symbol')
    const decimals = params.get('decimals')

    const fallbackToken = useMemo(() => {
        return createERC20Token(
            chainId,
            address ?? '',
            name ? name : undefined,
            symbol ? symbol : undefined,
            Number.parseInt(decimals ?? '0', 10),
        )
    }, [chainId, address, name, symbol, decimals])
    const { data: coin } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, address ?? '', fallbackToken, { chainId })

    return (
        <PageContainer title="Swap">
            <DefaultWeb3ContextProvider>
                <AllProviderTradeContext.Provider>
                    <Trader
                        share={shareToTwitterAsPopup}
                        defaultInputCoin={coin as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>}
                        chainId={chainId}
                    />
                </AllProviderTradeContext.Provider>
            </DefaultWeb3ContextProvider>
        </PageContainer>
    )
}
