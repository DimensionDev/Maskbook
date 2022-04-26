import Auth from '@masknet/web3-constants/flow/auth.json'
import Chain from '@masknet/web3-constants/flow/chain.json'
import Token from '@masknet/web3-constants/flow/token.json'
import { hookTransform, transform } from '@masknet/web3-shared-base'
import { ChainId } from '../types'

export const getAuthConstants = transform(ChainId, Auth)
export const useAuthConstants = hookTransform(getAuthConstants)

export const getChainConstants = transform(ChainId, Chain)
export const useCahinConstants = hookTransform(getChainConstants)

export const getTokenConstants = transform(ChainId, Token)
export const useTokenConstants = hookTransform(getTokenConstants)
