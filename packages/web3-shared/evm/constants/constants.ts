import Airdrop from '@masknet/web3-constants/evm/airdrop.json'
import Ethereum from '@masknet/web3-constants/evm/ethereum.json'
import DeBank from '@masknet/web3-constants/evm/debank.json'
import CoinGecko from '@masknet/web3-constants/evm/coingecko.json'
import CoinMarketCap from '@masknet/web3-constants/evm/coinmarketcap.json'
import Zerion from '@masknet/web3-constants/evm/zerion.json'
import Gitcoin from '@masknet/web3-constants/evm/gitcoin.json'
import OpenOcean from '@masknet/web3-constants/evm/openocean.json'
import ITO from '@masknet/web3-constants/evm/ito.json'
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
import BenQi from '@masknet/web3-constants/evm/benqi.json'
import Aurigami from '@masknet/web3-constants/evm/aurigami.json'
import Tranquil from '@masknet/web3-constants/evm/tranquil.json'
import Compound from '@masknet/web3-constants/evm/compound.json'
import Moola from '@masknet/web3-constants/evm/moola.json'
import Giest from '@masknet/web3-constants/evm/giest.json'
import Alpaca from '@masknet/web3-constants/evm/alpaca.json'
import { hookTransform, transform, transformFromJSON } from '@masknet/web3-shared-base'
import { ChainId } from '../types'

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

export const getAirdropConstants = transform(ChainId, Airdrop)
export const useAirdropConstants = hookTransform(getAirdropConstants)

export const getEthereumConstants = transform(ChainId, Ethereum)
export const useEthereumConstants = hookTransform(getEthereumConstants)

export const getDeBankConstants = transform(ChainId, DeBank)
export const useDeBankConstants = hookTransform(getDeBankConstants)

export const getCoinGeckoConstants = transform(ChainId, CoinGecko)
export const useCoinGeckoConstants = hookTransform(getCoinGeckoConstants)

export const getCoinMarketCapConstants = transform(ChainId, CoinMarketCap)
export const useCoinMarketCapConstants = hookTransform(getCoinMarketCapConstants)

export const getZerionConstants = transform(ChainId, Zerion)
export const useZerionConstants = hookTransform(getZerionConstants)

export const getGitcoinConstants = transform(ChainId, Gitcoin)
export const useGitcoinConstants = hookTransform(getGitcoinConstants)

export const getOpenOceanConstants = transform(ChainId, OpenOcean)
export const useOpenOceanConstants = hookTransform(getOpenOceanConstants)

export const getITOConstants = transform(ChainId, ITO)
export const useITOConstants = hookTransform(getITOConstants)

export const getRedPacketConstants = transform(ChainId, RedPacket)
export const useRedPacketConstants = hookTransform(getRedPacketConstants)

export const getTokenConstants = transform(ChainId, Token)
export const useTokenConstants = hookTransform(getTokenConstants)

export const getTraderConstants = transform(ChainId, Trader)
export const useTraderConstants = hookTransform(getTraderConstants)

export const getTrendingConstants = transform(ChainId, Trending)
export const useTrendingConstants = hookTransform(getTrendingConstants)

export const getMaskBoxConstants = transform(ChainId, MaskBox)
export const useMaskBoxConstants = hookTransform(getMaskBoxConstants)

export const getRPCConstants = transformFromJSON(ChainId, getEnvConstants('WEB3_CONSTANTS_RPC'), RPC)
export const useRPCConstants = hookTransform(getRPCConstants)

export const getExplorerConstants = transform(ChainId, Explorer)
export const useExplorerConstants = hookTransform(getExplorerConstants)

export const getTokenListConstants = transform(ChainId, TokenList)
export const useTokenListConstants = hookTransform(getTokenListConstants)

export const getTokenAssetBaseURLConstants = transform(ChainId, TokenAssetBaseURL)
export const useTokenAssetBaseURLConstants = hookTransform(getTokenAssetBaseURLConstants)

export const getPoolTogetherConstants = transform(ChainId, PoolTogether)
export const usePoolTogetherConstants = hookTransform(getPoolTogetherConstants)

export const getGoodGhostingConstants = transform(ChainId, GoodGhosting)
export const useGoodGhostingConstants = hookTransform(getGoodGhostingConstants)

export const getSpaceStationGalaxyConstants = transform(ChainId, SpaceStationGalaxy)
export const useSpaceStationGalaxyConstants = hookTransform(getSpaceStationGalaxyConstants)

export const getOpenseaAPIConstants = transform(ChainId, OpenseaAPI)
export const useOpenseaAPIConstants = hookTransform(getOpenseaAPIConstants)

export const getCryptoArtAIConstants = transform(ChainId, CryptoArtAI)
export const useCryptoArtAIConstants = hookTransform(getCryptoArtAIConstants)

export const getArtBlocksConstants = transform(ChainId, ArtBlocks)
export const useArtBlocksConstants = hookTransform(getArtBlocksConstants)

export const getNftRedPacketConstants = transform(ChainId, NftRedPacket)
export const useNftRedPacketConstants = hookTransform(getNftRedPacketConstants)

export const getAaveConstants = transform(ChainId, Aave)
export const useAaveConstants = hookTransform(getAaveConstants)

export const getLidoConstants = transform(ChainId, Lido)
export const useLidoConstants = hookTransform(getLidoConstants)

export const getBenQiConstants = transform(ChainId, BenQi)
export const useBenQiConstants = hookTransform(getBenQiConstants)

export const getAurigamiConstants = transform(ChainId, Aurigami)
export const useAurigamiConstants = hookTransform(getAurigamiConstants)

export const getTranquilConstants = transform(ChainId, Tranquil)
export const useTranquilConstants = hookTransform(getTranquilConstants)

export const getCompoundConstants = transform(ChainId, Compound)
export const useCompoundConstants = hookTransform(getCompoundConstants)

export const getMoolaConstants = transform(ChainId, Moola)
export const useMoolaConstants = hookTransform(getMoolaConstants)

export const getGiestConstants = transform(ChainId, Giest)
export const useGiestConstants = hookTransform(getGiestConstants)

export const getAlpacaConstants = transform(ChainId, Alpaca)
export const useAlpacaConstants = hookTransform(getAlpacaConstants)
