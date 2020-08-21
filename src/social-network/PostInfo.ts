import { DOMProxy, LiveSelector, ValueRef } from '@holoflows/kit/es'
import { ProfileIdentifier, PostIdentifier, Identifier } from '../database/type'
import type { Payload } from '../utils/type-transform/Payload'
import {
    TypedMessage,
    makeTypedMessageCompound,
    isTypedMessageEqual,
    TypedMessageCompound,
} from '../protocols/typed-message'
import { Result, Err } from 'ts-results'
import { ObservableSet, ObservableMap } from '../utils/ObservableMapSet'
import { parseURL } from '../utils/utils'
export abstract class PostInfo {
    constructor() {
        const calc = () => {
            const by = this.postBy.value
            const id = this.postID.value
            if (by.isUnknown || id === null) this.postIdentifier.value = null
            else this.postIdentifier.value = new PostIdentifier(by, id)
        }
        this.postID.addListener(calc)
        this.postBy.addListener(calc)

        // update in-post links automatically
        this.postContent.addListener((post) => {
            this.postMentionedLinks.clear()
            this.postMentionedLinks.add(...parseURL(post))
        })
    }
    readonly nickname = new ValueRef<string | null>(null)
    readonly avatarURL = new ValueRef<string | null>(null)
    readonly postBy = new ValueRef(ProfileIdentifier.unknown, Identifier.equals)
    readonly postID = new ValueRef<string | null>(null)
    /** This property is auto computed. */
    readonly postIdentifier = new ValueRef<null | PostIdentifier<ProfileIdentifier>>(null, Identifier.equals)
    /** @deprecated Use parsedPostContent instead */
    readonly postContent = new ValueRef('')
    /** @deprecated It should appear in the transformedPostContent */
    readonly postPayload = new ValueRef<Result<Payload, Error>>(Err(new Error('Empty')))
    abstract readonly commentsSelector?: LiveSelector<HTMLElement, false>
    abstract readonly commentBoxSelector?: LiveSelector<HTMLElement, false>
    /**
     * The un-decrypted post content.
     * It MUST be the original result (but can be updated by the original parser).
     */
    readonly parsedPostContent = new ValueRef<TypedMessageCompound>(makeTypedMessageCompound([]), isTypedMessageEqual)
    /**
     * The un-decrypted post content after transformation.
     */
    readonly transformedPostContent = new ValueRef<TypedMessage>(makeTypedMessageCompound([]), isTypedMessageEqual)
    /** @deprecated It should appear in the transformedPostContent */
    readonly decryptedPostContent = new ValueRef<TypedMessage | null>(null)
    /** @deprecated It should appear in the transformedPostContent */
    readonly decryptedPostContentRaw = new ValueRef('')
    abstract readonly rootNode: HTMLElement
    abstract readonly rootNodeProxy: DOMProxy
    /** The links appears in the post content */
    readonly postMentionedLinks = new ObservableSet<string>()
    /**
     * The images as attachment of post
     * @deprecated it should appear in parsedPostContent
     */
    readonly postMetadataImages = new ObservableSet<string>()
    /**
     * The links does not appear in the post content
     * TODO: move it somewhere else
     */
    readonly postMetadataMentionedLinks = new ObservableMap<HTMLAnchorElement, string>()
}

export const emptyPostInfo: PostInfo = new (class extends PostInfo {
    commentBoxSelector = undefined
    commentsSelector = undefined
    rootNode = undefined!
    rootNodeProxy = undefined!
})()
