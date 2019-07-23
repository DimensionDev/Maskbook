import { defineSocialNetworkUI } from '../../social-network/ui'

defineSocialNetworkUI({
    name: 'Facebook',
    init(env, pref) {},
    shouldActivate() {
        return location.hostname.endsWith('facebook.com')
    },
})
