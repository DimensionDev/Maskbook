import { memoizePromise, unreachable } from '@dimensiondev/kit'
import { DomainType, Domain } from '@masknet/web3-shared'
import * as ENS from '../apis/ens'

const fetchDomainsByTwitterIdCached = memoizePromise(ENS.fetchDomainsByTwitterId, (twitterId) => twitterId)

export async function getDomainsByTwitterId(twitterId: string, domainType: DomainType): Promise<Domain[]> {
    switch (domainType) {
        case DomainType.ENS:
            return (await fetchDomainsByTwitterIdCached(twitterId)).map((x) => ({
                label: '',
                ownerAddress: x.owner,
                resolvedAddress: x.owner,
            }))
        case DomainType.UNS:
            throw new Error('To be implemented.')
        case DomainType.DNS:
            throw new Error('To be implemented.')
        default:
            unreachable(domainType)
    }
}
