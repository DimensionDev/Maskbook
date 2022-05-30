import Chain from '@masknet/web3-constants/solana/chain.json'
import Token from '@masknet/web3-constants/solana/token.json'
import { hookTransform, transform } from '@masknet/web3-shared-base'
import { ChainId } from '../types'

export const getTokenConstants = transform(ChainId, Token)
export const useTokenConstants = hookTransform(getTokenConstants)

export const getChainConstants = transform(ChainId, Chain)
export const useChainConstants = hookTransform(getChainConstants)
