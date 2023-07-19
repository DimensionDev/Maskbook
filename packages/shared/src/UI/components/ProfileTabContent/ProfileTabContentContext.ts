import type { IdentityResolved } from '@masknet/plugin-infra'
import type { SocialAccount, SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { createContainer } from 'unstated-next'

function useProfileTabContext(initialState?: {
    currentVisitingSocialIdentity?: IdentityResolved
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
    currentSocialIdentity?: SocialIdentity
}) {
    return {
        currentVisitingSocialIdentity: initialState?.currentVisitingSocialIdentity,
        socialAccounts: initialState?.socialAccounts,
        currentSocialIdentity: initialState?.currentSocialIdentity,
    }
}

export const ProfileTabContext = createContainer(useProfileTabContext)
ProfileTabContext.Provider.displayName = 'ProfileTabContext'
