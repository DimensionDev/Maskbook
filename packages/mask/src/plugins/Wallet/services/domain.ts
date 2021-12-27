import { EthereumAddress } from 'wallet.ts'
import { Resolution } from '@unstoppabledomains/resolution'
import { AddressName, AddressNameType, ChainId, isZeroAddress, ProviderType } from '@masknet/web3-shared-evm'
import * as ENS from '../apis/ens'
import { createWeb3 } from '../../../extension/background-script/EthereumServices/web3'
import { PluginProfileRPC } from '../../Profile/messages'
import { PluginNFTAvatarRPC } from '../../Avatar/messages'

const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
const ADDRESS_FULL = /0x\w+/
const RSS3_URL_RE = /https?:\/\/(?<name>[\w.]+)\.rss3\.bio/
const RSS3_RNS_RE = /(?<name>[\w.]+)\.rss3/

function isValidAddress(address: string) {
    return address && EthereumAddress.isValid(address) && !isZeroAddress(address)
}

function getEthereumName(twitterId: string, nickname: string, bio: string) {
    const [matched] = nickname.match(ENS_RE) ?? bio.match(ENS_RE) ?? []
    if (matched) return matched
    return twitterId && !twitterId.endsWith('.eth') ? `${twitterId}.eth` : ''
}

function getRSS3Id(nickname: string, profileURL: string, bio: string) {
    const matched =
        nickname.match(RSS3_RNS_RE) || profileURL.match(RSS3_URL_RE) || bio.match(RSS3_URL_RE) || bio.match(RSS3_RNS_RE)
    return matched?.groups?.name ?? ''
}

function getAddress(text: string) {
    const [matched] = text.match(ADDRESS_FULL) ?? []
    if (matched && EthereumAddress.isValid(matched)) return matched
    return ''
}

async function getResolvedENS(label: string) {
    const web3 = await createWeb3({
        chainId: ChainId.Mainnet,
        providerType: ProviderType.MaskWallet,
    })
    return web3.eth.ens.getAddress(label)
}

async function getResolvedUNS(label: string) {
    const resolution = new Resolution()
    const result = await resolution.records(label, ['crypto.ETH.address'])
    return result['crypto.ETH.address']
}

export async function getAddressNames(identity: {
    identifier: {
        userId: string
        network: string
    }
    avatar?: string
    bio?: string
    nickname?: string
    homepage?: string
}) {
    const { identifier, bio = '', nickname = '', homepage = '' } = identity
    const twitterId = identifier.network === 'twitter.com' ? identifier.userId : ''

    const address = getAddress(bio)
    const ethereumName = getEthereumName(twitterId ?? '', nickname, bio)
    const RSS3Id = getRSS3Id(nickname, homepage, bio)

    const allSettled = await Promise.allSettled([
        getResolvedENS(ethereumName),
        getResolvedUNS(ethereumName),
        PluginProfileRPC.getRSS3AddressById(RSS3Id),
        ENS.fetchAddressNamesByTwitterId(twitterId?.toLowerCase() ?? '').then(
            (result) => result.find((x) => x.owner)?.owner ?? '',
        ),
        PluginNFTAvatarRPC.getAddress(twitterId ?? ''),
    ])

    const getSettledAddress = (result: PromiseSettledResult<string>) => {
        return result.status === 'fulfilled' ? result.value : ''
    }

    const addressENS = getSettledAddress(allSettled[0])
    const addressUNS = getSettledAddress(allSettled[1])
    const addressRSS3 = getSettledAddress(allSettled[2])
    const addressTheGraph = getSettledAddress(allSettled[3])
    const addressGUN = getSettledAddress(allSettled[4])

    return [
        isValidAddress(address)
            ? {
                  type: AddressNameType.ADDRESS,
                  label: address,
                  resolvedAddress: address,
              }
            : null,
        isValidAddress(addressENS)
            ? {
                  type: AddressNameType.ENS,
                  label: ethereumName,
                  resolvedAddress: addressENS,
              }
            : null,
        isValidAddress(addressUNS)
            ? {
                  type: AddressNameType.UNS,
                  label: ethereumName,
                  resolvedAddress: addressUNS,
              }
            : null,
        isValidAddress(addressRSS3)
            ? {
                  type: AddressNameType.RSS3,
                  label: `${RSS3Id}.rss3`,
                  resolvedAddress: addressRSS3,
              }
            : null,
        isValidAddress(addressGUN)
            ? {
                  type: AddressNameType.GUN,
                  label: addressGUN,
                  resolvedAddress: addressGUN,
              }
            : null,
        isValidAddress(addressTheGraph)
            ? {
                  type: AddressNameType.THE_GRAPH,
                  label: addressTheGraph,
                  resolvedAddress: addressTheGraph,
              }
            : null,
    ].filter(Boolean) as AddressName[]
}
