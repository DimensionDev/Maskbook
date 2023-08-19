import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ProfileTabContent, ProfileTabContext } from '@masknet/shared'
import { currentSocialIdentity, currentVisitingSocialIdentity, socialAccounts } from '../mock.js'
import { PageContainer } from '../components/PageContainer.js'

export interface Web3ProfilePageProps {}

export default function Web3ProfilePage(props: Web3ProfilePageProps) {
    return (
        <PageContainer title="Web3 Profile">
            <DefaultWeb3ContextProvider>
                <ProfileTabContext.Provider
                    initialState={{
                        currentVisitingSocialIdentity,
                        socialAccounts,
                        currentSocialIdentity,
                    }}>
                    <ProfileTabContent />
                </ProfileTabContext.Provider>
            </DefaultWeb3ContextProvider>
        </PageContainer>
    )
}
