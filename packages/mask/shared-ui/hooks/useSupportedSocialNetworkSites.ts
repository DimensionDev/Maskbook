import { noop } from 'lodash-es'
import Services from '#services'
import { createHook } from './createHook.js'

export const useSupportedSocialNetworkSites = createHook(
    () => Services.SiteAdaptor.getSupportedSites({ isSocialNetwork: true }),
    noop,
)

export interface SiteAdaptor {
    networkIdentifier: string
}
