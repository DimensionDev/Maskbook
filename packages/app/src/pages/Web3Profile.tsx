import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider, useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { createERC20Token } from '@masknet/web3-shared-evm'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { StickySearchHeader } from '../components/StickySearchBar.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { Web3ProfileForm } from '@masknet/plugin-web3-profile'

export interface Web3ProfilePageProps {}

export default function Web3ProfilePage(props: Web3ProfilePageProps) {
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
        <DashboardContainer>
            <StickySearchHeader />

            <main>
                <DashboardHeader title="W3bProfile" />

                <div className="bg-white p-5">
                    <div className="border pt-3 rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                                    <Web3ProfileForm />
                                </Web3ContextProvider>
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
