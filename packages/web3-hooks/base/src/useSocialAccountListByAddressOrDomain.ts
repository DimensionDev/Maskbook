import { EMPTY_LIST, type Web3BioProfile } from '@masknet/shared-base'
import { Web3Bio } from '@masknet/web3-providers'
import { attemptUntil } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'

export function useSocialAccountListByAddressOrDomain(
    address: string,
    domain?: string,
    defaultProfiles?: Web3BioProfile[],
) {
    return useQuery({
        queryKey: ['web3-bio', 'profiles', address, domain],
        placeholderData: defaultProfiles,
        queryFn: () => {
            if (!address && !domain) return EMPTY_LIST
            return attemptUntil(
                [
                    async () => (domain ? Web3Bio.getProfilesBy(domain) : EMPTY_LIST),
                    async () => (address ? Web3Bio.getProfilesBy(address) : EMPTY_LIST),
                ],
                undefined,
                (result) => !result?.length,
            )
        },
    })
}
