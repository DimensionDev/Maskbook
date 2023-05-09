import Ethereum from '@masknet/web3-constants/evm/ethereum.json'
import DeBank from '@masknet/web3-constants/evm/debank.json'
import CoinGecko from '@masknet/web3-constants/evm/coingecko.json'
import CoinMarketCap from '@masknet/web3-constants/evm/coinmarketcap.json'
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
import Etherscan from '@masknet/web3-constants/evm/etherscan.json'
import TokenList from '@masknet/web3-constants/evm/token-list.json'
import TokenAssetBaseURL from '@masknet/web3-constants/evm/token-asset-base-url.json'
import ArtBlocks from '@masknet/web3-constants/evm/artblocks.json'
import Aave from '@masknet/web3-constants/evm/aave.json'
import Lido from '@masknet/web3-constants/evm/lido.json'
import Game from '@masknet/web3-constants/evm/game.json'
import Pet from '@masknet/web3-constants/evm/pet.json'
import SmartPay from '@masknet/web3-constants/evm/smart-pay.json'
import ENS from '@masknet/web3-constants/evm/ens.json'
import Arb from '@masknet/web3-constants/evm/arb.json'
import SpaceId from '@masknet/web3-constants/evm/space-id.json'
import LensProfile from '@masknet/web3-constants/evm/lens-profile.json'
import GoPlusLabs from '@masknet/web3-constants/evm/gopluslabs.json'
import Lens from '@masknet/web3-constants/evm/lens.json'
import CryptoPunks from '@masknet/web3-constants/evm/cryptopunks.json'
import Airdrop from '@masknet/web3-constants/evm/airdrop.json'
import NameWrapper from '@masknet/web3-constants/evm/namewrapper.json'

import {
    transformAllHook,
    transformHook,
    transformAll,
    transform,
    transformAllFromJSON,
    transformFromJSON,
} from '@masknet/web3-shared-base'
import { ChainId } from '../types/index.js'

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

export const getEthereumConstant = transform(ChainId, Ethereum)
export const getEthereumConstants = transformAll(ChainId, Ethereum)
export const useEthereumConstant = transformHook(getEthereumConstants)
export const useEthereumConstants = transformAllHook(getEthereumConstants)

export const getDeBankConstant = transform(ChainId, DeBank)
export const getDeBankConstants = transformAll(ChainId, DeBank)
export const useDeBankConstant = transformHook(getDeBankConstants)
export const useDeBankConstants = transformAllHook(getDeBankConstants)

export const getCoinGeckoConstant = transform(ChainId, CoinGecko)
export const getCoinGeckoConstants = transformAll(ChainId, CoinGecko)
export const useCoinGeckoConstant = transformHook(getCoinGeckoConstants)
export const useCoinGeckoConstants = transformAllHook(getCoinGeckoConstants)

export const getCoinMarketCapConstant = transform(ChainId, CoinMarketCap)
export const getCoinMarketCapConstants = transformAll(ChainId, CoinMarketCap)
export const useCoinMarketCapConstant = transformHook(getCoinMarketCapConstants)
export const useCoinMarketCapConstants = transformAllHook(getCoinMarketCapConstants)

export const getGitcoinConstant = transform(ChainId, Gitcoin)
export const getGitcoinConstants = transformAll(ChainId, Gitcoin)
export const useGitcoinConstant = transformHook(getGitcoinConstants)
export const useGitcoinConstants = transformAllHook(getGitcoinConstants)

export const getOpenOceanConstant = transform(ChainId, OpenOcean)
export const getOpenOceanConstants = transformAll(ChainId, OpenOcean)
export const useOpenOceanConstant = transformHook(getOpenOceanConstants)
export const useOpenOceanConstants = transformAllHook(getOpenOceanConstants)

export const getITOConstant = transform(ChainId, ITO)
export const getITOConstants = transformAll(ChainId, ITO)
export const useITOConstant = transformHook(getITOConstants)
export const useITOConstants = transformAllHook(getITOConstants)

export const getRedPacketConstant = transform(ChainId, RedPacket)
export const getRedPacketConstants = transformAll(ChainId, RedPacket)
export const useRedPacketConstant = transformHook(getRedPacketConstants)
export const useRedPacketConstants = transformAllHook(getRedPacketConstants)

export const getTokenConstant = transform(ChainId, Token)
export const getTokenConstants = transformAll(ChainId, Token)
export const useTokenConstant = transformHook(getTokenConstants)
export const useTokenConstants = transformAllHook(getTokenConstants)

export const getTraderConstant = transform(ChainId, Trader)
export const getTraderConstants = transformAll(ChainId, Trader)
export const useTraderConstant = transformHook(getTraderConstants)
export const useTraderConstants = transformAllHook(getTraderConstants)

export const getTrendingConstant = transform(ChainId, Trending)
export const getTrendingConstants = transformAll(ChainId, Trending)
export const useTrendingConstant = transformHook(getTrendingConstants)
export const useTrendingConstants = transformAllHook(getTrendingConstants)

export const getMaskBoxConstant = transform(ChainId, MaskBox)
export const getMaskBoxConstants = transformAll(ChainId, MaskBox)
export const useMaskBoxConstant = transformHook(getMaskBoxConstants)
export const useMaskBoxConstants = transformAllHook(getMaskBoxConstants)

export const getRPCConstants = transformAllFromJSON(ChainId, getEnvConstants('WEB3_CONSTANTS_RPC'), RPC)
export const getRPCConstant = transformFromJSON(ChainId, getEnvConstants('WEB3_CONSTANTS_RPC'), RPC)
export const useRPCConstant = transformHook(getRPCConstants)
export const useRPCConstants = transformAllHook(getRPCConstants)

export const getEtherscanConstant = transform(ChainId, Etherscan)
export const getEtherscanConstants = transformAll(ChainId, Etherscan)
export const useEtherscanConstant = transformHook(getEtherscanConstants)
export const useEtherscanConstants = transformAllHook(getEtherscanConstants)

export const getTokenListConstant = transform(ChainId, TokenList)
export const getTokenListConstants = transformAll(ChainId, TokenList)
export const useTokenListConstant = transformHook(getTokenListConstants)
export const useTokenListConstants = transformAllHook(getTokenListConstants)

export const getTokenAssetBaseURLConstant = transform(ChainId, TokenAssetBaseURL)
export const getTokenAssetBaseURLConstants = transformAll(ChainId, TokenAssetBaseURL)
export const useTokenAssetBaseURLConstant = transformHook(getTokenAssetBaseURLConstants)
export const useTokenAssetBaseURLConstants = transformAllHook(getTokenAssetBaseURLConstants)

export const getArtBlocksConstant = transform(ChainId, ArtBlocks)
export const getArtBlocksConstants = transformAll(ChainId, ArtBlocks)
export const useArtBlocksConstant = transformHook(getArtBlocksConstants)
export const useArtBlocksConstants = transformAllHook(getArtBlocksConstants)

export const getNftRedPacketConstant = transform(ChainId, NftRedPacket)
export const getNftRedPacketConstants = transformAll(ChainId, NftRedPacket)
export const useNftRedPacketConstant = transformHook(getNftRedPacketConstants)
export const useNftRedPacketConstants = transformAllHook(getNftRedPacketConstants)

export const getAaveConstant = transform(ChainId, Aave)
export const getAaveConstants = transformAll(ChainId, Aave)
export const useAaveConstant = transformHook(getAaveConstants)
export const useAaveConstants = transformAllHook(getAaveConstants)

export const getLidoConstant = transform(ChainId, Lido)
export const getLidoConstants = transformAll(ChainId, Lido)
export const useLidoConstant = transformHook(getLidoConstants)
export const useLidoConstants = transformAllHook(getLidoConstants)

export const getGameConstant = transform(ChainId, Game)
export const getGameConstants = transformAll(ChainId, Game)
export const useGameConstant = transformHook(getGameConstants)
export const useGameConstants = transformAllHook(getGameConstants)

export const getPetConstant = transform(ChainId, Pet)
export const getPetConstants = transformAll(ChainId, Pet)
export const usePetConstant = transformHook(getPetConstants)
export const usePetConstants = transformAllHook(getPetConstants)

export const getSmartPayConstant = transform(ChainId, SmartPay)
export const getSmartPayConstants = transformAll(ChainId, SmartPay)
export const useSmartPayConstant = transformHook(getSmartPayConstants)
export const useSmartPayConstants = transformAllHook(getSmartPayConstants)

export const getENSConstants = transformAll(ChainId, ENS)
export const getArbConstants = transformAll(ChainId, Arb)
export const getSpaceIdConstants = transformAll(ChainId, SpaceId)
export const getLensProfileConstants = transformAll(ChainId, LensProfile)
export const getGoPlusLabsConstants = transformAll(ChainId, GoPlusLabs)
export const getNameWrapperContrants = transformAll(ChainId, NameWrapper)

export const getLensConstant = transform(ChainId, Lens)
export const getLensConstants = transformAll(ChainId, Lens)
export const useLensConstant = transformHook(getLensConstants)
export const useLensConstants = transformAllHook(getLensConstants)

export const getCryptoPunksConstants = transformAll(ChainId, CryptoPunks)

export const getAirdropClaimersConstant = transform(ChainId, Airdrop)
export const getAirdropClaimersConstants = transformAll(ChainId, Airdrop)
export const useAirdropClaimersConstant = transformHook(getAirdropClaimersConstants)
export const useAirdropClaimersConstants = transformAllHook(getAirdropClaimersConstants)
