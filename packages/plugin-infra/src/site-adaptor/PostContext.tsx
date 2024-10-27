import { createContext, useContext } from 'react'
import { type Subscription, useSubscription } from 'use-subscription'
import type { Some } from 'ts-results-es'
import type { LiveSelector, DOMProxy } from '@dimensiondev/holoflows-kit'
import {
    ObservableMap,
    ObservableSet,
    type PostIVIdentifier,
    ValueRef,
    type PostIdentifier,
    type ProfileIdentifier,
    type EnhanceableSite,
} from '@masknet/shared-base'
import { useObservableValues, useValueRef } from '@masknet/shared-base-ui'
import type { TypedMessage } from '@masknet/typed-message'
import type { SupportedPayloadVersions } from '@masknet/encryption'

export interface PostContextActions {
    hasPayloadLike(content: string): boolean
    getURLFromPostIdentifier?(post: PostIdentifier): URL | null
}
export interface PostContextAuthor {
    readonly site: EnhanceableSite | null
    /** Firefly only */
    readonly source: 'Lens' | 'Farcaster' | 'Twitter' | null
    readonly nickname: Subscription<string | null>
    readonly avatarURL: Subscription<URL | null>
    readonly author: Subscription<ProfileIdentifier | null>
    readonly handle: Subscription<string | null>
    /** post id on the network. */
    readonly postID: Subscription<string | null>
}

export interface PostContextCoAuthor {
    nickname?: string
    /** TODO Refactor to string */
    avatarURL?: URL
    author: ProfileIdentifier
    post: PostIdentifier
}

export interface PostContextComment {
    readonly commentsSelector: LiveSelector<HTMLElement>
    readonly commentBoxSelector: LiveSelector<HTMLElement>
}
export interface PostContextCreation extends PostContextAuthor {
    readonly rootElement: DOMProxy
    readonly actionsElement?: DOMProxy
    readonly isFocusing?: boolean
    readonly suggestedInjectionPoint: HTMLElement
    readonly comments?: PostContextComment
    readonly coAuthors: Subscription<PostContextCoAuthor[]>
    /**
     * The result of this subscription will be merged with `PostContext.postMentionedLinks`.
     *
     * You don't need to provide this to resolve links in `PostContext.postContent`.
     */
    readonly postMentionedLinksProvider?: Subscription<string[]>
    /** @deprecated It should parse image into rawMessage */
    readonly postImagesProvider?: Subscription<string[]>
    /**
     * The raw TypedMessage that the site gives.
     */
    readonly rawMessage: Subscription<TypedMessage>
    readonly signal?: AbortSignal
}
export interface PostContext extends PostContextAuthor {
    // #region DOM knowledge
    get rootNode(): HTMLElement | null
    readonly rootElement: DOMProxy
    readonly actionsElement?: DOMProxy
    readonly isFocusing?: boolean
    readonly suggestedInjectionPoint: HTMLElement
    // #endregion
    readonly comment: PostContextComment | undefined
    // #region Metadata of a post (author, mentioned items, ...)
    /** Auto computed */
    readonly identifier: Subscription<PostIdentifier | null>
    readonly url: Subscription<URL | null>
    readonly coAuthors: Subscription<PostContextCoAuthor[] | null>
    // Meta
    readonly mentionedLinks: Subscription<string[]>
    /** @deprecated It should appears in rawMessage */
    readonly postMetadataImages: Subscription<string[]>
    // #endregion
    // #region Raw post content (not decrypted)
    readonly rawMessage: Subscription<TypedMessage>
    readonly encryptComment: ValueRef<null | ((commentToEncrypt: string) => Promise<string>)>
    readonly decryptComment: ValueRef<null | ((commentEncrypted: string) => Promise<string | null>)>
    // #endregion
    // #region Post payload discovered in the rawMessage
    /**
     * Caution & TODO: Payload in postMetadataImages won't be reflected in this currently.
     */
    readonly hasMaskPayload: Subscription<boolean>
    readonly postIVIdentifier: Subscription<PostIVIdentifier | null>
    /**
     * undefined => payload not found
     */
    readonly publicShared: Subscription<boolean | undefined>
    readonly isAuthorOfPost: Subscription<boolean | undefined>
    readonly version: Subscription<SupportedPayloadVersions | undefined>

    decryptedReport(content: {
        sharedPublic?: Some<boolean>
        iv?: string
        isAuthorOfPost?: Some<boolean>
        version?: SupportedPayloadVersions
    }): void
    // #endregion
}
export type PostInfo = PostContext

export const PostInfoContext = createContext<PostContext | null>(null)
PostInfoContext.displayName = 'PostInfoContext'

export const usePostInfoDetails: {
    // Change to use* when https://github.com/microsoft/TypeScript/issues/44643 fixed
    [key in keyof PostInfo]: () => PostInfo[key] extends ValueRef<infer T> ? T
    : PostInfo[key] extends ObservableSet<infer T> ? readonly T[]
    : PostInfo[key] extends ObservableMap<any, infer T> ? readonly T[]
    : PostInfo[key] extends Subscription<infer T> ? T
    : PostInfo[key]
} = {
    __proto__: new Proxy(
        { __proto__: null },
        {
            get(_, key) {
                if (typeof key === 'symbol') return undefined
                function usePostInfoDetails() {
                    const postInfo = useContext(PostInfoContext)
                    if (!postInfo) throw new TypeError('No post context')
                    if (!(key in postInfo)) throw new TypeError('postInfo.' + (key as string) + ' is not found')
                    const k = postInfo[key as keyof PostInfo]
                    // eslint-disable-next-line react-compiler/react-compiler
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    if (k instanceof ValueRef) return useValueRef<any>(k)
                    // eslint-disable-next-line react-compiler/react-compiler
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    if (k instanceof ObservableMap) return useObservableValues<any>(k)
                    // eslint-disable-next-line react-compiler/react-compiler
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    if (k instanceof ObservableSet) return useObservableValues<any>(k)
                    // eslint-disable-next-line react-compiler/react-compiler
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    if (isSubscription(k)) return useSubscription<any>(k)
                    return k
                }
                Object.defineProperty(usePostInfoDetails, key, { value: usePostInfoDetails, configurable: true })
                return usePostInfoDetails
            },
        },
    ),
} as any

export const {
    postID: usePostInfoPostID,
    identifier: usePostInfoIdentifier,
    postIVIdentifier: usePostInfoPostIVIdentifier,
    rawMessage: usePostInfoRawMessage,
    mentionedLinks: usePostInfoMentionedLinks,
    author: usePostInfoAuthor,
    nickname: usePostInfoNickname,
    coAuthors: usePostInfoCoAuthors,
    encryptComment: usePostInfoEncryptComment,
    decryptComment: usePostInfoDecryptComment,
    url: usePostInfoURL,
    source: usePostInfoSource,
    site: usePostInfoSite,
    postMetadataImages: usePostInfoPostMetadataImages,
} = usePostInfoDetails
function isSubscription(x: any): x is Subscription<any> {
    return (
        typeof x === 'object' &&
        x !== null &&
        !!((x as Subscription<any>).getCurrentValue && (x as Subscription<any>).subscribe)
    )
}
