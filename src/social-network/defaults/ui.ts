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

const defaultInjections = {
    injectCommentBox: 'disabled',
    injectPostComments: 'disabled',
    injectWelcomeBanner: 'disabled',
} as const

export const defaultSocialNetworkUI = cloneDeep({
    ...defaultDataSources,
    ...defaultInjections,
    injectCommentBox: injectCommentBoxDefaultFactory(),
    injectPostComments: injectPostCommentsDefault(),
    injectOptionsPageLink: 'disabled',
} as const)
