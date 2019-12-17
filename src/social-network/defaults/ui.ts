import { injectCommentBoxDefaultFactory } from './injectCommentBox'
import { injectPostCommentsDefault } from './injectComments'
import { SocialNetworkUIDataSources } from '../ui'
import { ValueRef } from '@holoflows/kit'
import { ProfileIdentifier } from '../../database/type'
import { cloneDeep } from 'lodash-es'
import { Profile, Group, Persona } from '../../database'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../../utils/theme'
import { ProfileArrayComparer, GroupArrayComparer, PersonaArrayComparer } from '../../utils/comparer'

const defaultDataSources: Required<SocialNetworkUIDataSources> = cloneDeep({
    friendsRef: new ValueRef([] as Profile[], ProfileArrayComparer),
    myIdentitiesRef: new ValueRef([] as Profile[], ProfileArrayComparer),
    myPersonasRef: new ValueRef([] as Persona[], PersonaArrayComparer),
    groupsRef: new ValueRef([] as Group[], GroupArrayComparer),
    currentIdentity: new ValueRef<Profile | null>(null),
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
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
    useTheme: () => MaskbookLightTheme,
    i18nOverwrite: { zh: {}, en: {} },
    injectKnownIdentity: 'disabled',
} as const)
