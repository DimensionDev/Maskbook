import { Web3ContextProvider, useChainContext } from '@masknet/web3-hooks-base'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { OverviewPage as OverviewPager } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export interface OverviewPageProps {}

export default function OverviewPage(props: OverviewPageProps) {
    const { account } = useChainContext()

    console.log('--------')
    console.log('account', account)
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Overview" />
                <div className="bg-black p-5">
                    <div className="border rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <Web3ContextProvider
                                    value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
                                    <OverviewPager />
                                </Web3ContextProvider>
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
