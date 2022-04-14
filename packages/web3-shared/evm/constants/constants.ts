import Airdrop from '@masknet/web3-constants/evm/airdrop.json'
import Ethereum from '@masknet/web3-constants/evm/ethereum.json'
import DeBank from '@masknet/web3-constants/evm/debank.json'
import CoinGecko from '@masknet/web3-constants/evm/coingecko.json'
import CoinMarketCap from '@masknet/web3-constants/evm/coinmarketcap.json'
import Zerion from '@masknet/web3-constants/evm/zerion.json'
import Gitcoin from '@masknet/web3-constants/evm/gitcoin.json'
import OpenOcean from '@masknet/web3-constants/evm/openocean.json'
import ITO from '@masknet/web3-constants/evm/ito.json'
import LBP from '@masknet/web3-constants/evm/lbp.json'
import RedPacket from '@masknet/web3-constants/evm/red-packet.json'
import NftRedPacket from '@masknet/web3-constants/evm/nft-red-packet.json'
import Token from '@masknet/web3-constants/evm/token.json'
import Trader from '@masknet/web3-constants/evm/trader.json'
import Trending from '@masknet/web3-constants/evm/trending.json'
import MaskBox from '@masknet/web3-constants/evm/mask-box.json'
import RPC from '@masknet/web3-constants/evm/rpc.json'
import Explorer from '@masknet/web3-constants/evm/explorer.json'
import PoolTogether from '@masknet/web3-constants/evm/pooltogether.json'
import TokenList from '@masknet/web3-constants/evm/token-list.json'
import TokenAssetBaseURL from '@masknet/web3-constants/evm/token-asset-base-url.json'
import GoodGhosting from '@masknet/web3-constants/evm/good-ghosting.json'
import SpaceStationGalaxy from '@masknet/web3-constants/evm/space-station-galaxy.json'
import OpenseaAPI from '@masknet/web3-constants/evm/opensea-api.json'
import CryptoArtAI from '@masknet/web3-constants/evm/cryptoartai.json'
import ArtBlocks from '@masknet/web3-constants/evm/artblocks.json'
import Aave from '@masknet/web3-constants/evm/aave.json'
import Lido from '@masknet/web3-constants/evm/lido.json'
import Venus from '@masknet/web3-constants/evm/venus.json'
import { hookTransform, transform, transformFromJSON } from './utils'

function getEnvConstants(key: 'WEB3_CONSTANTS_RPC') {
    try {
        const map = {
            WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC,
        }
        return map[key] ?? ''
    } catch {
        return ''
    }
}

export const getAirdropConstants = transform(Airdrop)
export const useAirdropConstants = hookTransform(getAirdropConstants)

export const getEthereumConstants = transform(Ethereum)
export const useEthereumConstants = hookTransform(getEthereumConstants)

export const getDeBankConstants = transform(DeBank)
export const useDeBankConstants = hookTransform(getDeBankConstants)

export const getCoinGeckoConstants = transform(CoinGecko)
export const useCoinGeckoConstants = hookTransform(getCoinGeckoConstants)

export const getCoinMarketCapConstants = transform(CoinMarketCap)
export const useCoinMarketCapConstants = hookTransform(getCoinMarketCapConstants)

export const getZerionConstants = transform(Zerion)
export const useZerionConstants = hookTransform(getZerionConstants)

export const getGitcoinConstants = transform(Gitcoin)
export const useGitcoinConstants = hookTransform(getGitcoinConstants)

export const getOpenOceanConstants = transform(OpenOcean)
export const useOpenOceanConstants = hookTransform(getOpenOceanConstants)

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

export const getRPCConstants = transformFromJSON(getEnvConstants('WEB3_CONSTANTS_RPC'), RPC)
export const useRPCConstants = hookTransform(getRPCConstants)

export const getExplorerConstants = transform(Explorer)
export const useExplorerConstants = hookTransform(getExplorerConstants)

export const getTokenListConstants = transform(TokenList)
export const useTokenListConstants = hookTransform(getTokenListConstants)

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

export const getCryptoArtAIConstants = transform(CryptoArtAI)
export const useCryptoArtAIConstants = hookTransform(getCryptoArtAIConstants)

export const getArtBlocksConstants = transform(ArtBlocks)
export const useArtBlocksConstants = hookTransform(getArtBlocksConstants)

export const getNftRedPacketConstants = transform(NftRedPacket)
export const useNftRedPacketConstants = hookTransform(getNftRedPacketConstants)

export const getAaveConstants = transform(Aave)
export const useAaveConstants = hookTransform(getAaveConstants)

export const getLidoConstants = transform(Lido)
export const useLidoConstants = hookTransform(getLidoConstants)

export const getVenusConstants = transform(Venus)
export const useVenusConstants = hookTransform(getVenusConstants)
