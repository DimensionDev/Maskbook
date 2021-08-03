import { currentBaseURL } from '../constant'
import { isRegistrableDomain as _isRegistrableDomain } from '@dimensiondev/mask-webauthn/backend'

export function isRegistrableDomain(domain: string) {
    return _isRegistrableDomain(domain, currentBaseURL)
}
