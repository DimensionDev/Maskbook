import { filter, flatten, pick, uniq, values } from 'lodash-es'
import Gitcoin from '@masknet/web3-constants/evm/gitcoin.json'
import Lido from '@masknet/web3-constants/evm/lido.json'
import NftRedPacket from '@masknet/web3-constants/evm/nft-red-packet.json'
import RedPacket from '@masknet/web3-constants/evm/red-packet.json'

const collect = <T extends Record<string, Record<string, string | number>>>(
    data: T,
    fields: Array<keyof T>,
): string[] => {
    const groupedByFields = values(pick(data, fields))
    const listOfAddresses = groupedByFields.map((v) => values(v))
    const listOfAddress = flatten(listOfAddresses)
    const collected = filter(uniq(listOfAddress), Boolean) as string[]
    return collected.map((addr) => addr.toLowerCase())
}

const domainAddressMap: Record<string, string[]> = {
    'gitcoin.co': collect(Gitcoin as Pick<typeof Gitcoin, 'GITCOIN_ETH_ADDRESS' | 'BULK_CHECKOUT_ADDRESS'>, [
        'GITCOIN_ETH_ADDRESS',
        'BULK_CHECKOUT_ADDRESS',
    ]),
    'lido.fi': collect(Lido, ['LIDO_stETH_ADDRESS', 'LIDO_REFERRAL_ADDRESS']),
    'mask.io': [
        ...collect(RedPacket, [
            'HAPPY_RED_PACKET_ADDRESS_V1',
            'HAPPY_RED_PACKET_ADDRESS_V2',
            'HAPPY_RED_PACKET_ADDRESS_V3',
            'HAPPY_RED_PACKET_ADDRESS_V4',
        ]),
        ...collect(NftRedPacket, ['RED_PACKET_NFT_ADDRESS']),
    ],
}

// Not very common usage, no need to create a map of address-to-domain
export function getContractOwnerDomain(address?: string) {
    if (!address) return address
    const addr = address.toLowerCase()
    const pair = Object.entries(domainAddressMap).find(([, addresses]) => {
        return addresses.includes(addr)
    })
    return pair ? pair[0] : addr
}
