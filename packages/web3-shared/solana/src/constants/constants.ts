import Chain from '@masknet/web3-constants/solana/chain.json'
import Token from '@masknet/web3-constants/solana/token.json'
import CoinGecko from '@masknet/web3-constants/solana/coingecko.json'
import { transformAllHook, transformHook, transformAll, transform } from '@masknet/web3-shared-base'
import { ChainId } from '../types'

export const getTokenConstant = transform(ChainId, Token)
export const getTokenConstants = transformAll(ChainId, Token)
export const useTokenConstants = transformAllHook(getTokenConstants)
export const useTokenConstant = transformHook(getTokenConstants)

export const getChainConstant = transform(ChainId, Chain)
export const getChainConstants = transformAll(ChainId, Chain)
export const useChainConstants = transformAllHook(getChainConstants)
export const useChainConstant = transformHook(getChainConstants)

export const getCoinGeckoConstant = transform(ChainId, CoinGecko)
export const getCoinGeckoConstants = transformAll(ChainId, CoinGecko)
export const useCoinGeckoConstants = transformAllHook(getCoinGeckoConstants)
export const useCoinGeckoConstant = transformHook(getCoinGeckoConstants)
