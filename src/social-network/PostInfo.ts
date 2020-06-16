import { DOMProxy, LiveSelector, ValueRef } from '@holoflows/kit/es'
import { ProfileIdentifier, PostIdentifier, Identifier } from '../database/type'
import type { Payload } from '../utils/type-transform/Payload'
import type { TypedMessage } from '../extension/background-script/CryptoServices/utils'
import { Result, Err } from 'ts-results'
import { ObservableSet, ObservableMap } from '../utils/ObservableMapSet'
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
    }
    readonly nickname = new ValueRef<string | null>(null)
    readonly avatarURL = new ValueRef<string | null>(null)
    readonly postBy = new ValueRef(ProfileIdentifier.unknown, Identifier.equals)
    readonly postID = new ValueRef<string | null>(null)
    /** This property is auto computed. */
    readonly postIdentifier = new ValueRef<null | PostIdentifier<ProfileIdentifier>>(null, Identifier.equals)
    readonly postContent = new ValueRef('')
    readonly postPayload = new ValueRef<Result<Payload, Error>>(new Err(new Error('Empty')))
    readonly steganographyContent = new ValueRef('')
    abstract readonly commentsSelector?: LiveSelector<HTMLElement, false>
    abstract readonly commentBoxSelector?: LiveSelector<HTMLElement, false>
    readonly decryptedPostContent = new ValueRef<TypedMessage | null>(null)
    readonly decryptedPostContentRaw = new ValueRef('')
    abstract readonly rootNode: HTMLElement
    abstract readonly rootNodeProxy: DOMProxy
    // TODO: Implement this
    readonly postMetadataImages = new ObservableSet<HTMLImageElement>()
    // TODO: add in-post links
    readonly postMetadataMentionedLinks = new ObservableMap<HTMLElement, string>()
}

export const emptyPostInfo: PostInfo = new (class extends PostInfo {
    commentBoxSelector = undefined
    commentsSelector = undefined
    rootNode = undefined!
    rootNodeProxy = undefined!
})()
