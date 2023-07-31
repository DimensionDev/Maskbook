import Token from '@masknet/web3-constants/evm/token.json'
import { transformAllHook, transformHook, transformAll, transform } from '@masknet/web3-shared-base'
import { ChainId } from '../types/index.js'

export const getTokenConstant = transform(ChainId, Token)
export const getTokenConstants = transformAll(ChainId, Token)
export const useTokenConstant = transformHook(getTokenConstants)
export const useTokenConstants = transformAllHook(getTokenConstants)
