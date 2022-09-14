import Auth from '@masknet/web3-constants/flow/auth.json'
import Chain from '@masknet/web3-constants/flow/chain.json'
import Token from '@masknet/web3-constants/flow/token.json'
import { transformAllHook, transformHook, transformAll, transform } from '@masknet/web3-shared-base'
import { ChainId } from '../types.js'

export const getAuthConstants = transformAll(ChainId, Auth)
export const getAuthConstant = transform(ChainId, Auth)
export const useAuthConstants = transformAllHook(getAuthConstants)
export const useAuthConstant = transformHook(getAuthConstants)

export const getChainConstants = transformAll(ChainId, Chain)
export const getChainConstant = transform(ChainId, Chain)
export const useChainConstants = transformAllHook(getChainConstants)
export const useChainConstant = transformHook(getChainConstants)

export const getTokenConstants = transformAll(ChainId, Token)
export const getTokenConstant = transform(ChainId, Token)
export const useTokenConstants = transformAllHook(getTokenConstants)
export const useTokenConstant = transformHook(getTokenConstants)
