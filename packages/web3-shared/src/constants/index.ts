import Airdrop from '@masknet/constants/data/airdrop.json'
import Ethereum from '@masknet/constants/data/ethereum.json'
import Gitcoin from '@masknet/constants/data/gitcoin.json'
import ITO from '@masknet/constants/data/ito.json'
import LBP from '@masknet/constants/data/lbp.json'
import RedPacket from '@masknet/constants/data/red-packet.json'
import Token from '@masknet/constants/data/token.json'
import Trader from '@masknet/constants/data/trader.json'
import Trending from '@masknet/constants/data/trending.json'
import URL from '@masknet/constants/data/url.json'
import { hookTransform, transform } from './utils'

export const getAirdropConstants = transform(Airdrop)
export const useAirdropConstants = hookTransform(getAirdropConstants)

export const getEthereumConstants = transform(Ethereum)
export const useEthereumConstants = hookTransform(getEthereumConstants)

export const getGitcoinConstants = transform(Gitcoin)
export const useGitcoinConstants = hookTransform(getGitcoinConstants)

export const getITOConstants = transform(ITO)
export const useITOConstants = hookTransform(getITOConstants)

export const getLBPConstants = transform(LBP)
export const useLBPConstants = hookTransform(getLBPConstants)

export const getRedPacketConstants = transform(RedPacket)
export const useRedPacketConstants = hookTransform(getRedPacketConstants)

export const getTokenConstants = transform(Token)
export const useTokenConstants = hookTransform(getTokenConstants)

export const getTraderConstants = transform(Trader)
export const useTraderConstants = hookTransform(getTraderConstants)

export const getTrendingConstants = transform(Trending)
export const useTrendingConstants = hookTransform(getTrendingConstants)

export const getURLConstants = transform(URL)
export const useURLConstants = hookTransform(getURLConstants)

const ETHEREUM_TOKEN_ASSET_BASE_URIS = [
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum',
    'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/ethereum',
]
const SMARTCHAIN_TOKEN_ASSET_BASE_URIS = [
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain',
    'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/smartchain',
]
const POLYGON_TOKEN_ASSET_BASE_URIS = [
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon',
    'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/polygon',
]
