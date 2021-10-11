import Airdrop from '@masknet/web3-constants/data/airdrop.json'
import Ethereum from '@masknet/web3-constants/data/ethereum.json'
import Gitcoin from '@masknet/web3-constants/data/gitcoin.json'
import ITO from '@masknet/web3-constants/data/ito.json'
import LBP from '@masknet/web3-constants/data/lbp.json'
import RedPacket from '@masknet/web3-constants/data/red-packet.json'
import NftRedPacket from '@masknet/web3-constants/data/nft-red-packet.json'
import Token from '@masknet/web3-constants/data/token.json'
import Trader from '@masknet/web3-constants/data/trader.json'
import Trending from '@masknet/web3-constants/data/trending.json'
import MaskBox from '@masknet/web3-constants/data/mask-box.json'
import RPC from '@masknet/web3-constants/data/rpc.json'
import PoolTogether from '@masknet/web3-constants/data/pooltogether.json'
import TokenAssetBaseURL from '@masknet/web3-constants/data/token-asset-base-url.json'
import GoodGhosting from '@masknet/web3-constants/data/good-ghosting.json'
import SpaceStationGalaxy from '@masknet/web3-constants/data/space-station-galaxy.json'
import OpenseaAPI from '@masknet/web3-constants/data/opensea-api.json'
import Chain from '@masknet/web3-constants/data/chain.json'
import { hookTransform, transform, transformFromJSON } from './utils'

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

export const getNftRedPacketConstants = transform(NftRedPacket)
export const useNftRedPacketConstants = hookTransform(getNftRedPacketConstants)

// for estimate gas
export const FAKE_SIGN_PASSWORD = '0x75466cc969717b172b14253aaeebdc958f2b5037a852c1337650ed4978242dd9'

// for ens address
export enum EthereumNameType {
    ENS_TYPE = 'ENS',
    UNS_TYPE = 'UNS',
    DEFAULT = 'address',
}
