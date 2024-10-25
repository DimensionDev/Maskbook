export namespace Social {
    export type PostType = 'Post' | 'Comment' | 'Quote' | 'Mirror'

    export enum ProfileStatus {
        Active = 'active',
        Inactive = 'inactive',
    }
    export interface Tag {
        tagId: string
        label: string
    }
    export enum NetworkType {
        Ethereum = 'Ethereum',
    }
    export enum Source {
        Farcaster = 'Farcaster',
        Lens = 'Lens',
    }
    export enum SourceInURL {
        Farcaster = 'farcaster',
        Lens = 'lens',
    }
    export type SocialSource = Source.Farcaster | Source.Lens

    /** Normalized Channel, different from Farcaster's */
    export interface Channel {
        source: SocialSource
        id: string
        name: string
        description?: string
        imageUrl: string
        url: string
        parentUrl: string
        followerCount: number
        mutualFollowerCount?: number
        /** time in milliseconds */
        timestamp: number
        lead?: Profile
        hosts?: Profile[]
        blocked?: boolean
        __original__?: unknown
    }

    export interface Profile {
        /** fid for Farcaster, twitter id for Twitter */
        profileId: string
        displayName: string
        handle: string
        fullHandle: string
        pfp: string
        bio?: string
        address?: string
        followerCount: number
        followingCount: number
        status: ProfileStatus
        tags?: Tag[]
        verified: boolean
        signless?: boolean
        viewerContext?: {
            following?: boolean
            followedBy?: boolean
            blocking?: boolean
        }
        ownedBy?: {
            networkType: NetworkType
            address: string
        }
        source: SocialSource
        // Farcaster only
        isPowerUser?: boolean
        website?: string
        location?: string
    }
    export interface MediaObject {
        title?: string
        mimeType?: string
        // for twitter media_id
        id?: string
        url: string
    }
    export enum RestrictionType {
        Everyone = 0,
        OnlyPeopleYouFollow = 1,
        MentionedProfiles = 2,
    }

    export interface Attachment {
        type: 'Image' | 'Video' | 'Audio' | 'Poll' | 'AnimatedGif' | 'Unknown'
        uri: string
        coverUri?: string
        artist?: string
        title?: string
    }
    export enum POLL_CHOICE_TYPE {
        Single = 'single-choice',
        Multiple = 'multiple-choice',
    }
    export enum POLL_STRATEGIES {
        None = '[]',
    }
    export interface PollOption {
        id: string
        position?: number
        label: string
        votes?: number
        isVoted?: boolean
        percent?: number
    }

    export interface Poll {
        id: string
        options: PollOption[]
        source: SocialSource
        durationSeconds: number
        endDatetime?: string
        votingStatus?: string
        type: POLL_CHOICE_TYPE
        multiple_count?: string
        strategies: POLL_STRATEGIES
    }

    export interface Post {
        /**
         * For Farcaster, it's hash of the cast.
         * For Lens, it's id of the publication, which is different from post id.
         * TODO id for Twitter
         */
        publicationId: string
        type?: PostType
        /** It's `hash` for Farcaster */
        postId: string
        parentPostId?: string
        parentAuthor?: Profile
        /** time in milliseconds */
        timestamp?: number
        author: Profile
        reporter?: Profile
        mediaObjects?: MediaObject[]
        permalink?: string
        parentPermalink?: string
        isHidden?: boolean
        isEncrypted?: boolean
        isEncryptedByMask?: boolean
        restriction?: RestrictionType
        metadata: {
            locale: string
            description?: string
            content: {
                content?: string
                /**
                 * The primary asset of the post.
                 */
                asset?: Attachment
                /**
                 * The full list of attachments of the post. (must include the primary asset)
                 */
                attachments?: Attachment[]
                /**
                 * The oembed url at the bottom of the post.
                 */
                oembedUrl?: string
                /**
                 * The full list of oembed urls of the post.
                 */
                oembedUrls?: string[]
            } | null
            contentURI?: string
            article?: {
                cover?: string
                title: string
                content?: string
            }
        }
        stats?: {
            comments: number
            mirrors: number
            quotes?: number
            /** Like count */
            reactions: number
            bookmarks?: number
            countOpenActions?: number
        }
        mirrors?: Profile[]
        reactions?: Profile[]
        canComment?: boolean
        canMirror?: boolean
        canAct?: boolean
        mentions?: Profile[]
        hasMirrored?: boolean
        hasLiked?: boolean
        hasActed?: boolean
        hasQuoted?: boolean
        hasBookmarked?: boolean
        source: SocialSource
        isThread?: boolean

        /**
         * Sometimes we need to render a thread, and we currently support up to three level.
         * root
         * |
         * commentOn
         * |
         * post
         *
         * As shown above, `root` represents the start of the thread.
         * the current post itself represents the end of the thread.
         * and `commentOn` represents the post to which the current post is a reply.
         */
        commentOn?: Post
        root?: Post
        quoteOn?: Post
        mirrorOn?: Post
        comments?: Post[]
        embedPosts?: Post[]
        channel?: Channel
        poll?: Poll
        /**
         * Lens only
         * To mirror a post on momoka, need to invoke with the client method mirrorOnMomoka
         */
        momoka?: {
            proof: string
        }
        /**
         * Lens only
         * If the current post type is Comment, this field is the first comment in this comment list.
         */
        firstComment?: Post
        /**
         * Farcaster Only
         * Used to add a post to the corresponding channel, like 'firefly-garden'
         */
        parentChannelKey?: string
        /**
         * Farcaster Only
         * Used to add a post to the corresponding channel, like channel
         */
        parentChannelUrl?: string

        /**
         * Farcaster Only
         * The API of Firefly will return a "threads" field indicating that this is a thread post.
         * The "threads" contains the second and third levels of threads.
         */
        threads?: Post[]
        sendFrom?: {
            displayName?: string
            name?: string
        }

        /**
         * Lens Only
         * Used to act a post
         */
        collectModule?: {
            collectedCount: number
            collectLimit?: number
            assetAddress?: string
            currency?: string
            usdPrice?: string
            amount?: number
            referralFee?: number
            followerOnly?: boolean
            contract: {
                address?: string
                chainId?: number
            }
            endsAt?: string | null
            // Lens Only
            type?: string
        }
        __original__?: unknown
    }
    export enum LensMetadataAttributeKey {
        Poll = 'pollId',
    }
}
