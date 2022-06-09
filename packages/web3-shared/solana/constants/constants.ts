import Chain from '@masknet/web3-constants/solana/chain.json'
import Token from '@masknet/web3-constants/solana/token.json'
import CoinGecko from '@masknet/web3-constants/solana/coingecko.json'
import { hookTransform, transform } from '@masknet/web3-shared-base'
import { ChainId } from '../types'

export const getTokenConstants = transform(ChainId, Token)
export const useTokenConstants = hookTransform(getTokenConstants)

export const getChainConstants = transform(ChainId, Chain)
export const useChainConstants = hookTransform(getChainConstants)

export const getCoinGeckoConstants = transform(ChainId, CoinGecko)
export const useCoinGeckoConstants = hookTransform(getCoinGeckoConstants)
