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
                                        account: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
                                    }}>
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
