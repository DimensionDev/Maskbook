import { type NextIDPlatform } from '@masknet/shared-base'

export interface Web3BioProfile {
    links: {
        [key in NextIDPlatform]: {
            link: string
            handle: string
        }
    }
}
