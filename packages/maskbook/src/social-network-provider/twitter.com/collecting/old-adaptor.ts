import type { SocialNetworkUIInformationCollector } from '../../../social-network/ui'
import { instanceOfTwitterUI } from '../ui-provider'
import { resolveLastRecognizedIdentity } from './identity'
import { registerUserCollector } from './profiles'
import { registerPostCollector } from './post'

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: () => registerUserCollector(instanceOfTwitterUI),
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
