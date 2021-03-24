import { SocialNetworkUI, stateCreator } from '../../social-network'
import { instagramShared } from './shared'
import { instagramBase } from './base'
import { IdentityProviderInstagram } from './collecting/identity-provider'
import { PostProviderInstagram } from './collecting/posts'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults'
import { dispatchCustomEvents } from '../../utils/utils'
import { injectPostInspectorInstagram } from './injection/post-inspector'
import { newPostCompositionInstagram } from './injection/newPostComposition'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
const define: SocialNetworkUI.Definition = {
    ...instagramShared,
    ...instagramBase,
    automation: {
        nativeCompositionDialog: {
            attachImage(url, options) {
                if (url instanceof Blob) url = URL.createObjectURL(url)
                dispatchCustomEvents(null, 'instagramUpload', url)
            },
        },
    },
    collecting: {
        identityProvider: IdentityProviderInstagram,
        postsProvider: PostProviderInstagram,
    },
    configuration: {
        setupWizard: {
            disableSayHello: true,
        },
    },
    customization: {},
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles,instagramBase.networkIdentifier )
        // No need to init cause this network is not going to support those features now.
        return { friends, profiles }
    },
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(instagramBase.networkIdentifier),
        postInspector: injectPostInspectorInstagram,
        newPostComposition: {
            start: newPostCompositionInstagram,
            supportedInputTypes: { text: true, image: true },
            supportedOutputTypes: { text: false, image: true },
        },
    },
    permission: {
        request: () => browser.permissions.request({ origins }),
        has: () => browser.permissions.contains({ origins }),
    },
}
export default define
