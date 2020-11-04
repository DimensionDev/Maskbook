import { template } from 'lodash-es'
import { getActivatedUI } from '../../social-network/ui'

export function useShareLink<T extends object>(tpl: string, payload?: T) {
    const compiled = template(tpl)
    switch (getActivatedUI()?.networkIdentifier) {
        case 'twitter.com':
            return `https://twitter.com/intent/tweet?text=${encodeURIComponent(compiled(payload))}`
        case 'facebook.com':
            return `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(compiled(payload))}&u=mask.io`
        default:
            return ''
    }
}
