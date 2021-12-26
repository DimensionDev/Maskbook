import { memoizePromise, unreachable } from '@dimensiondev/kit'
import { AddressNameType, AddressName } from '@masknet/web3-shared-evm'
import * as ENS from '../apis/ens'

const fetchAddressNamesByTwitterIdCached = memoizePromise(ENS.fetchAddressNamesByTwitterId, (twitterId) => twitterId)

export async function getAddressNames(twitterId: string, addressNameType: AddressNameType): Promise<AddressName[]> {
    switch (addressNameType) {
        case AddressNameType.ENS:
            return (await fetchAddressNamesByTwitterIdCached(twitterId.toLowerCase())).map((x) => ({
                label: '',
                ownerAddress: x.owner,
                resolvedAddress: x.owner,
            }))
        case AddressNameType.UNS:
            throw new Error('To be implemented.')
        case AddressNameType.DNS:
            throw new Error('To be implemented.')
        default:
            unreachable(addressNameType)
    }
}
