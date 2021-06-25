import Airdrop from '@masknet/constants/data/Airdrop.json'
import Ethereum from '@masknet/constants/data/ethereum.json'
import Gitcoin from '@masknet/constants/data/gitcoin.json'
import ITO from '@masknet/constants/data/ITO.json'
import LBP from '@masknet/constants/data/LBP.json'
import RedPacket from '@masknet/constants/data/red-packet.json'
import Tokens from '@masknet/constants/data/tokens.json'
import Trader from '@masknet/constants/data/trader.json'
import Trending from '@masknet/constants/data/trending.json'
import URL from '@masknet/constants/data/URL.json'
import { hookTransform, transform } from './utils'

export const getITOConstants = transform(ITO)
export const useITOConstants = hookTransform(getITOConstants)

export const getLBPConstants = transform(LBP)
export const useLBPConstants = hookTransform(getLBPConstants)

export const getURLConstants = transform(URL)
export const useURLConstants = hookTransform(getURLConstants)

export const getAirdropConstants = transform(Airdrop)
export const useAirdropConstants = hookTransform(getAirdropConstants)

export const getEthereumConstants = transform(Ethereum)
export const useEthereumConstants = hookTransform(getEthereumConstants)

export const getGitcoinConstants = transform(Gitcoin)
export const useGitcoinConstants = hookTransform(getGitcoinConstants)

export const getRedPacketConstants = transform(RedPacket)
export const useRedPacketConstants = hookTransform(getRedPacketConstants)

export const getTokensConstants = transform(Tokens)
export const useTokensConstants = hookTransform(getTokensConstants)

export const getTraderConstants = transform(Trader)
export const useTraderConstants = hookTransform(getTraderConstants)

export const getTrendingConstants = transform(Trending)
export const useTrendingConstants = hookTransform(getTrendingConstants)
