import { getEnumAsArray } from '@masknet/kit'
import Chain from '@masknet/web3-constants/solana/chain.json' with { type: 'json' }
import CoinGecko from '@masknet/web3-constants/solana/coingecko.json' with { type: 'json' }
import TokenList from '@masknet/web3-constants/solana/token-list.json' with { type: 'json' }
import Token from '@masknet/web3-constants/solana/token.json' with { type: 'json' }
import { transform, transformAll, transformAllHook, transformHook } from '@masknet/web3-shared-base'
import { ChainId } from '../types.js'

export const ChainIdList = getEnumAsArray(ChainId).map((x) => x.value)

export const getTokenConstant = transform(ChainId, Token)
export const getTokenConstants = transformAll(ChainId, Token)
export const useTokenConstants = transformAllHook(getTokenConstants)
export const useTokenConstant = transformHook(getTokenConstants)

export const getTokenListConstant = transform(ChainId, TokenList)
export const getTokenListConstants = transformAll(ChainId, TokenList)

export const getChainConstant = transform(ChainId, Chain)
export const getChainConstants = transformAll(ChainId, Chain)
export const useChainConstants = transformAllHook(getChainConstants)
export const useChainConstant = transformHook(getChainConstants)

export const getCoinGeckoConstant = transform(ChainId, CoinGecko)
export const getCoinGeckoConstants = transformAll(ChainId, CoinGecko)
export const useCoinGeckoConstants = transformAllHook(getCoinGeckoConstants)
export const useCoinGeckoConstant = transformHook(getCoinGeckoConstants)
