import CoinGecko from '@masknet/web3-constants/evm/coingecko.json'
import DeBank from '@masknet/web3-constants/evm/debank.json'
import ENS from '@masknet/web3-constants/evm/ens.json'
import Ethereum from '@masknet/web3-constants/evm/ethereum.json'
import Etherscan from '@masknet/web3-constants/evm/etherscan.json'
import LensProfile from '@masknet/web3-constants/evm/lens-profile.json'
import Lens from '@masknet/web3-constants/evm/lens.json'
import NftRedPacket from '@masknet/web3-constants/evm/nft-red-packet.json'
import RedPacket from '@masknet/web3-constants/evm/red-packet.json'
import RPC from '@masknet/web3-constants/evm/rpc.json'
import SpaceId from '@masknet/web3-constants/evm/space-id.json'
import TokenAssetBaseURL from '@masknet/web3-constants/evm/token-asset-base-url.json'
import TokenList from '@masknet/web3-constants/evm/token-list.json'
import Token from '@masknet/web3-constants/evm/token.json'

import { getEnumAsArray } from '@masknet/kit'
import {
    transform,
    transformAll,
    transformAllFromJSON,
    transformAllHook,
    transformFromJSON,
    transformHook,
} from '@masknet/web3-shared-base'
import { ChainId } from '../types/index.js'

function getEnvConstants(key: 'WEB3_CONSTANTS_RPC') {
    try {
        const map = {
            WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC,
        }
        return map[key] || ''
    } catch {
        return ''
    }
}

export const ChainIdList = getEnumAsArray(ChainId).map((x) => x.value)

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

export const getRedPacketConstant = transform(ChainId, RedPacket)
export const getRedPacketConstants = transformAll(ChainId, RedPacket)
export const useRedPacketConstant = transformHook(getRedPacketConstants)
export const useRedPacketConstants = transformAllHook(getRedPacketConstants)

export const getTokenConstant = transform(ChainId, Token)
export const getTokenConstants = transformAll(ChainId, Token)
export const useTokenConstant = transformHook(getTokenConstants)
export const useTokenConstants = transformAllHook(getTokenConstants)

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

// see https://github.com/DimensionDev/assets/
export const getTokenAssetBaseURLConstant = transform(ChainId, TokenAssetBaseURL)
export const getTokenAssetBaseURLConstants = transformAll(ChainId, TokenAssetBaseURL)
export const useTokenAssetBaseURLConstant = transformHook(getTokenAssetBaseURLConstants)
export const useTokenAssetBaseURLConstants = transformAllHook(getTokenAssetBaseURLConstants)

export const getNftRedPacketConstant = transform(ChainId, NftRedPacket)
export const getNftRedPacketConstants = transformAll(ChainId, NftRedPacket)
export const useNftRedPacketConstant = transformHook(getNftRedPacketConstants)
export const useNftRedPacketConstants = transformAllHook(getNftRedPacketConstants)

export const getENSConstants = transformAll(ChainId, ENS)
export const getSpaceIdConstants = transformAll(ChainId, SpaceId)
export const getLensProfileConstants = transformAll(ChainId, LensProfile)

export const getLensConstant = transform(ChainId, Lens)
export const getLensConstants = transformAll(ChainId, Lens)
export const useLensConstant = transformHook(getLensConstants)
export const useLensConstants = transformAllHook(getLensConstants)
