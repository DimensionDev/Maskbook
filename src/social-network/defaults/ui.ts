import { injectCommentBoxDefaultFactory } from './injectCommentBox'
import { injectPostCommentsDefault } from './injectComments'
import type { SocialNetworkUIDataSources } from '../ui'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '../../database/type'
import { cloneDeep } from 'lodash-es'
import type { Profile } from '../../database'
import { useMaskbookTheme } from '../../utils/theme'
import { ProfileArrayComparer, GroupArrayComparer } from '../../utils/comparer'
import { ObservableWeakMap } from '../../utils/ObservableMapSet'

const defaultDataSources: Required<SocialNetworkUIDataSources> = cloneDeep({
    friendsRef: new ValueRef([], ProfileArrayComparer),
    myIdentitiesRef: new ValueRef([], ProfileArrayComparer),
    groupsRef: new ValueRef([], GroupArrayComparer),
    currentIdentity: new ValueRef<Profile | null>(null),
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
    posts: new ObservableWeakMap(),
    typedMessageMetadata: new ValueRef<ReadonlyMap<string, any>>(new Map<string, any>()),
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
    useTheme: useMaskbookTheme,
    i18nOverwrite: { zh: {}, en: {} },
    componentOverwrite: {},
    injectKnownIdentity: 'disabled',
    injectDashboardEntrance: () => {},
} as const)
