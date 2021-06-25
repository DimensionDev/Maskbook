import * as constants from '@masknet/constants'
import { hookTransform, transform } from './utils'

export const getITOConstants = transform(constants.ITO)
export const useITOConstants = hookTransform(getITOConstants)

export const getLBPConstants = transform(constants.LBP)
export const useLBPConstants = hookTransform(getLBPConstants)

export const getURLConstants = transform(constants.URL)
export const useURLConstants = hookTransform(getURLConstants)

export const getAirdropConstants = transform(constants.Airdrop)
export const useAirdropConstants = hookTransform(getAirdropConstants)

export const getEthereumConstants = transform(constants.Ethereum)
export const useEthereumConstants = hookTransform(getEthereumConstants)

export const getGitcoinConstants = transform(constants.Gitcoin)
export const useGitcoinConstants = hookTransform(getGitcoinConstants)

export const getRedPacketConstants = transform(constants.RedPacket)
export const useRedPacketConstants = hookTransform(getRedPacketConstants)

export const getTokensConstants = transform(constants.Tokens)
export const useTokensConstants = hookTransform(getTokensConstants)

export const getTraderConstants = transform(constants.Trader)
export const useTraderConstants = hookTransform(getTraderConstants)

export const getTrendingConstants = transform(constants.Trending)
export const useTrendingConstants = hookTransform(getTrendingConstants)
