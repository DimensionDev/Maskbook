import './Welcome'
import './OptionsPage'
import './Injections'
import './shared'
import { definedSocialNetworkUIs, defineSocialNetworkUI } from '../social-network/ui'

definedSocialNetworkUIs.clear()
defineSocialNetworkUI({ friendlyName: 'Utopia', setupAccount: 'Setup your Utopia account in your dream' } as any)
defineSocialNetworkUI({ friendlyName: 'Neoparia Breakfast Club', setupAccount() {} } as any)
defineSocialNetworkUI({
    friendlyName: 'telnet',
    setupAccount: 'Embrace the eternal September!',
    isDangerousNetwork: true,
} as any)
defineSocialNetworkUI({
    friendlyName: 'MySpace',
    setupAccount() {},
    isDangerousNetwork: true,
} as any)
