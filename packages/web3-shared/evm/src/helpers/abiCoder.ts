import { lazyProxy } from '@masknet/shared-base'
import * as ABICoder from /* webpackDefer: true */ 'web3-eth-abi'

export const abiCoder = lazyProxy(() => ABICoder.default) as unknown as ABICoder.AbiCoder
