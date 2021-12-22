import Airdrop from '@masknet/web3-constants/evm/airdrop.json'
import Ethereum from '@masknet/web3-constants/evm/ethereum.json'
import Gitcoin from '@masknet/web3-constants/evm/gitcoin.json'
import ITO from '@masknet/web3-constants/evm/ito.json'
import LBP from '@masknet/web3-constants/evm/lbp.json'
import RedPacket from '@masknet/web3-constants/evm/red-packet.json'
import NftRedPacket from '@masknet/web3-constants/evm/nft-red-packet.json'
import Token from '@masknet/web3-constants/evm/token.json'
import Trader from '@masknet/web3-constants/evm/trader.json'
import Trending from '@masknet/web3-constants/evm/trending.json'
import MaskBox from '@masknet/web3-constants/evm/mask-box.json'
import RPC from '@masknet/web3-constants/evm/rpc.json'
import PoolTogether from '@masknet/web3-constants/evm/pooltogether.json'
import TokenAssetBaseURL from '@masknet/web3-constants/evm/token-asset-base-url.json'
import GoodGhosting from '@masknet/web3-constants/evm/good-ghosting.json'
import SpaceStationGalaxy from '@masknet/web3-constants/evm/space-station-galaxy.json'
import OpenseaAPI from '@masknet/web3-constants/evm/opensea-api.json'
import Chain from '@masknet/web3-constants/evm/chain.json'
import CryptoArtAI from '@masknet/web3-constants/evm/cryptoartai.json'
import { hookTransform, transform, transformFromJSON } from './utils'

export { ZERO_ADDRESS, NATIVE_TOKEN_ADDRESS, FAKE_SIGN_PASSWORD, EthereumNameType } from './specific'

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

export const getMaskBoxConstants = transform(MaskBox)
export const useMaskBoxConstants = hookTransform(getMaskBoxConstants)

let WEB3_CONSTANTS_RPC = ''
try {
    WEB3_CONSTANTS_RPC = process.env.WEB3_CONSTANTS_RPC ?? ''
} catch {}

export const getRPCConstants = transformFromJSON(WEB3_CONSTANTS_RPC, RPC)
export const useRPCConstants = hookTransform(getRPCConstants)

export const getTokenAssetBaseURLConstants = transform(TokenAssetBaseURL)
export const useTokenAssetBaseURLConstants = hookTransform(getTokenAssetBaseURLConstants)

export const getPoolTogetherConstants = transform(PoolTogether)
export const usePoolTogetherConstants = hookTransform(getPoolTogetherConstants)

export const getGoodGhostingConstants = transform(GoodGhosting)
export const useGoodGhostingConstants = hookTransform(getGoodGhostingConstants)

export const getSpaceStationGalaxyConstants = transform(SpaceStationGalaxy)
export const useSpaceStationGalaxyConstants = hookTransform(getSpaceStationGalaxyConstants)
export const getOpenseaAPIConstants = transform(OpenseaAPI)
export const useOpenseaAPIConstants = hookTransform(getOpenseaAPIConstants)

export const getChainConstants = transform(Chain)
export const useChainConstants = hookTransform(getChainConstants)

export const getCryptoArtAIConstants = transform(CryptoArtAI)
export const useCryptoArtAIConstants = hookTransform(getCryptoArtAIConstants)

export const getNftRedPacketConstants = transform(NftRedPacket)
export const useNftRedPacketConstants = hookTransform(getNftRedPacketConstants)
