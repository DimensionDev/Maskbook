// WARNING: Types with @public mark is exposed as public API to the native side,
//  if you make an incompatible change in this file, it will break the API.
import type { ChainId } from '@masknet/web3-shared'
import type { SetupGuideStep } from '../components/InjectedComponents/SetupGuide'
export interface ChainBlockNumber {
    chainId: ChainId
    blockNumber: number
}

export type SetupGuideCrossContextStatus = {
    /** The persona to be connected */
    persona?: string
    /** The user name given by user */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
}

/** @public */
export enum LaunchPage {
    facebook = 'facebook',
    twitter = 'twitter',
    dashboard = 'dashboard',
}
