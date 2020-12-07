// Hack: this file is exposed as part of public API to the native side,
//  if you make an incompatible change in this file, it will break the API.
import type { ChainId } from '../web3/types'
import type { SetupGuideStep } from '../components/InjectedComponents/SetupGuide'

export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}

export interface ChainState {
    chainId: ChainId
    blockNumber: number
}

export enum Language {
    zh = 'zh',
    en = 'en',
    ja = 'ja',
}

export type SetupGuideCrossContextStatus = {
    /** The persona to be connected */
    persona?: string
    /** The user name given by user */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
}

export enum LaunchPage {
    facebook = 'facebook',
    twitter = 'twitter',
    dashboard = 'dashboard',
}

export type NativeAPISettingsName = 'launchPageSettings'
