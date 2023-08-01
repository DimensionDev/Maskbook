import { BridgeStack } from '@masknet/plugin-cross-chain-bridge'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

export interface BridgePageProps {}

export default function BridgePage(props: BridgePageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Bridges" />

                <div className="bg-white p-5">
                    <DisableShadowRootContext.Provider value={false}>
                        <ShadowRootIsolation>
                            <BridgeStack />
                        </ShadowRootIsolation>
                    </DisableShadowRootContext.Provider>
                </div>
            </main>
        </DashboardContainer>
    )
}
