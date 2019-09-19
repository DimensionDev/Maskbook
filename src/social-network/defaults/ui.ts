import { injectCommentBoxDefaultFactory } from './injectCommentBox'
import { injectPostCommentsDefault } from './injectComments'
import { SocialNetworkUIDataSources } from '../ui'
import { ValueRef } from '@holoflows/kit'
import { PersonIdentifier } from '../../database/type'
import { cloneDeep } from 'lodash-es'

const defaultDataSources: Required<SocialNetworkUIDataSources> = cloneDeep({
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    groupsRef: new ValueRef([]),
    currentIdentity: new ValueRef(null),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    posts: new Map(),
})

/**
 * @desc why both undefined and null
 * undefined means undefined (at definition time),
 * everything must be defined at runtime
 * (for the convenient of managing config items),
 * so the null explicit defines "not available".
 */
const defaultInjections = {
    injectCommentBox: null,
    injectPostComments: null,
    injectWelcomeBanner: null,
}

export const defaultSocialNetworkUI = cloneDeep({
    ...defaultDataSources,
    ...defaultInjections,
    injectCommentBox: injectCommentBoxDefaultFactory(),
    injectPostComments: injectPostCommentsDefault(),
})
