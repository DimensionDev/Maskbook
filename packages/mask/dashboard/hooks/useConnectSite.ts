import { useAsyncFn } from 'react-use'
import Services from '#services'

export function useConnectSite() {
    return useAsyncFn(Services.SiteAdaptor.connectSite)
}
