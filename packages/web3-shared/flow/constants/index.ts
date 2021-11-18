import Auth from '@masknet/web3-constants/flow/auth.json'
import { hookTransform, transform } from '@masknet/web3-kit'
import { ChainId } from '../types'

export const getAuthConstants = transform(ChainId, Auth)
export const useAuthConstants = hookTransform(getAuthConstants)
