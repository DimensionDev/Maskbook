import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { ProfileTabContent, ProfileTabContext } from '@masknet/shared'
import { currentSocialIdentity, currentVisitingSocialIdentity, socialAccounts } from '../mock.js'

export interface Web3ProfilePageProps {}

export default function Web3ProfilePage(props: Web3ProfilePageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="W3b Profile" />

                <div className="bg-white p-5">
                    <div className="border rounded-lg" style={{ maxHeight: 700, overflowY: 'auto' }}>
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                                    <ProfileTabContext.Provider
                                        initialState={{
                                            currentVisitingSocialIdentity,
                                            socialAccounts,
                                            currentSocialIdentity,
                                        }}>
                                        <ProfileTabContent />
                                    </ProfileTabContext.Provider>
                                </Web3ContextProvider>
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}
