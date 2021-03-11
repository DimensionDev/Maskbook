import type { SocialNetworkUIInformationCollector } from '../../../social-network/ui'
import { instanceOfTwitterUI } from './index'
import { resolveLastRecognizedIdentity } from '../collecting/identity'
import { registerUserCollector } from '../collecting/profiles'
import { registerPostCollector } from '../collecting/post'

export const twitterUIFetch: SocialNetworkUIInformationCollector = {
    resolveLastRecognizedIdentity: () => resolveLastRecognizedIdentity(instanceOfTwitterUI),
    collectPeople: () => registerUserCollector(instanceOfTwitterUI),
    collectPosts: () => registerPostCollector(instanceOfTwitterUI),
}
