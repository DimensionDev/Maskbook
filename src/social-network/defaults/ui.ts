import { injectCommentBoxDefaultFactory } from './injectCommentBox'
import { injectPostCommentsDefault } from './injectComments'
import { SocialNetworkUIDataSources } from '../ui'
import { ValueRef } from '@holoflows/kit'
import { PersonIdentifier } from '../../database/type'
import { cloneDeep } from 'lodash-es'
import { Person, Group } from '../../database'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../../utils/theme'
import { PersonArrayComparer, GroupArrayComparer } from '../../utils/comparer'

const defaultDataSources: Required<SocialNetworkUIDataSources> = cloneDeep({
    friendsRef: new ValueRef([] as Person[], PersonArrayComparer),
    myIdentitiesRef: new ValueRef([] as Person[], PersonArrayComparer),
    groupsRef: new ValueRef([] as Group[], GroupArrayComparer),
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
    injectOptionsPageLink: 'disabled',
    darkTheme: MaskbookDarkTheme,
    lightTheme: MaskbookLightTheme,
    useColorScheme: () => 'light' as const,
    injectKnownIdentity: 'disabled',
} as const)
