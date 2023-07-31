import { getEnumAsArray } from '@masknet/kit'
import { ChainId } from '../types/index.js'

export const ChainIdList = getEnumAsArray(ChainId).map((x) => x.value)

// cspell: disable-next-line
export const ZERO_ADDRESS = '1BitcoinEaterAddressDontSendf59kuE'
