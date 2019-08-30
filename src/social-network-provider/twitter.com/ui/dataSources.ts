import { SocialNetworkUIDataSources } from '../../../social-network/ui'
import { ValueRef } from '@holoflows/kit'
import { PersonIdentifier } from '../../../database/type'

export const twitterUIDataSources: SocialNetworkUIDataSources = {
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    currentIdentity: new ValueRef(null),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    posts: new Map(),
}
