// WARNING: Types with @public mark is exposed as public API to the native side,
//  if you make an incompatible change in this file, it will break the API.
import type { ChainId } from '@masknet/web3-shared-evm'

export interface ChainBlockNumber {
    chainId: ChainId
    blockNumber: number
}

export type SetupGuideContext = {
    /** The persona to be connected */
    persona?: string
    /** The user name given by user */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
}

/**
 * @public
 * @deprecated
 */
export enum LaunchPage {
    facebook = 'facebook',
    twitter = 'twitter',
    dashboard = 'dashboard',
}

export enum SetupGuideStep {
    FindUsername = 'find-username',
    VerifyOnNextID = 'next-id-verify',
    PinExtension = 'pin-extension',
    Close = 'close',
}
