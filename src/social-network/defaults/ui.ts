import { injectCommentBoxDefaultFactory } from './injectCommentBox'
import { injectPostCommentsDefault } from './injectComments'
import { SocialNetworkUIDataSources } from '../ui'
import { ValueRef } from '@holoflows/kit'
import { PersonIdentifier } from '../../database/type'
import { cloneDeep } from 'lodash-es'
import { Person, Group } from '../../database'

const defaultDataSources: Required<SocialNetworkUIDataSources> = cloneDeep({
    friendsRef: new ValueRef([] as Person[]),
    myIdentitiesRef: new ValueRef([] as Person[]),
    groupsRef: new ValueRef([] as Group[]),
    currentIdentity: new ValueRef<Person | null>(null),
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
})
