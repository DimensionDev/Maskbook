import { resolveCrossOriginURL } from '@masknet/web3-shared-base'

export const TOKEN_VIEW_ROOT_URL = resolveCrossOriginURL(
    'https://nomics.com/data/currencies-ticker?filter=any&quote-currency=USD',
)
export const INTERVAL = '1d'
