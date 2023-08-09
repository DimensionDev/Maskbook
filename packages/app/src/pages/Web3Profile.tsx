import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ProfileTabContent, ProfileTabContext } from '@masknet/shared'
import { currentSocialIdentity, currentVisitingSocialIdentity, socialAccounts } from '../mock.js'
import { PageContainer } from '../components/PageContainer.js'

export interface Web3ProfilePageProps {}

export default function Web3ProfilePage(props: Web3ProfilePageProps) {
    return (
        <PageContainer title="Web3 Profile">
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
        </PageContainer>
    )
}
