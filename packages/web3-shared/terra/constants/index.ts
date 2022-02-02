import Token from '@masknet/web3-constants/terra/token.json'
import { hookTransform, transform } from '@masknet/web3-kit'
import { ChainId } from '../types'

export const getTokenConstants = transform(ChainId, Token)
export const useTokenConstants = hookTransform(getTokenConstants)
