import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { StickySearchHeader } from '../components/StickySearchBar.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { RedPacketForm } from '@masknet/plugin-redpacket'

export interface RedPacketPageProps {}

export default function RedPacketPage(props: RedPacketPageProps) {
    return (
        <DashboardContainer>
            <StickySearchHeader />

            <main>
                <DashboardHeader title="RedPacket" />

                <div className="bg-white p-5">
                    <div className="border pt-3 rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                                    <RedPacketForm />
                                </Web3ContextProvider>
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
