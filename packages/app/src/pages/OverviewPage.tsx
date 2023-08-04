import { Web3ContextProvider, useChainContext } from '@masknet/web3-hooks-base'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { ChartStatContext, OverviewPage as OverviewPager } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { stat } from '../mock.js'

export interface OverviewPageProps {}

export default function OverviewPage(props: OverviewPageProps) {
    const { account } = useChainContext()
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Overview" />
                <div className="bg-white p-5">
                    <div className="border rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <Web3ContextProvider
                                    value={{
                                        pluginID: NetworkPluginID.PLUGIN_EVM,
                                        chainId: ChainId.Mainnet,
                                        account,
                                    }}>
                                    <ChartStatContext.Provider
                                        initialState={{
                                            chartStat: stat,
                                        }}>
                                        <OverviewPager />
                                    </ChartStatContext.Provider>
                                </Web3ContextProvider>
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
