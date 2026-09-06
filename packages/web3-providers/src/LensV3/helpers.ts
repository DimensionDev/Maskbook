import type {
    Account,
    AccountMention,
    AnyPost,
    App,
    ArticleMetadata,
    EmbedMetadata,
    GroupMention,
    ImageMetadata,
    ReferencedPost,
    TextOnlyMetadata,
} from '@lens-protocol/client'
import { Social } from '@masknet/web3-providers/types'
import { last } from 'lodash-es'
import urlcat from 'urlcat'
import { URL_REGEX } from '../Firefly/constants.js'
import { getEmbedUrls } from '../Firefly/helpers.js'
import { composePollFrameUrl, isValidPollFrameUrl } from '../helpers/social.js'
import { FIREFLY_SITE_URL, LENS_MEDIA_SNAPSHOT_URL } from './constants.js'

const PLACEHOLDER_IMAGE = 'https://static-assets.hey.xyz/images/placeholder.webp'

export function getAccountAvatar(account: Account) {
    return account.metadata?.picture as string
}

export function formatLensProfile(account: Account): Social.Profile {
    return {
        profileId: account.address as string,
        displayName: account.metadata?.name || account.username?.localName || '',
        handle: account.username?.localName || account.metadata?.name || '',
        fullHandle: account.username?.value,
        pfp: getAccountAvatar(account),
        bio: account.metadata?.bio ?? undefined,
        address: account.address,
        followerCount: 0,
        followingCount: 0,
        status: Social.ProfileStatus.Active,
        verified: true,
        signless: false,
        ownedBy: {
            networkType: Social.NetworkType.Ethereum,
            address: account.username?.ownedBy as string,
        },
        viewerContext: {
            following: false,
            followedBy: false,
            blocking: false,
        },
        source: Social.Source.Lens,
        website: account.metadata?.attributes?.find((x) => x.key === 'website')?.value,
        location: account.metadata?.attributes?.find((x) => x.key === 'location')?.value,
    }
}

function formatApp(app: App | null) {
    return app?.metadata ?
            {
                displayName: app.metadata?.name,
                name: app.metadata?.name,
            }
        :   undefined
}

export function formatLensPost(result: AnyPost): Social.Post {
    const profile = formatLensProfile(result.author)
    const timestamp = new Date(result.timestamp).getTime()

    if (result.__typename === 'Repost') {
        const mirrorOnProfile = formatLensProfile(result.repostOf.author)
        const content = formatContent(
            result.repostOf.metadata as ArticleMetadata | TextOnlyMetadata | ImageMetadata | EmbedMetadata,
        )
        const oembedUrls = getEmbedUrls(content?.content ?? '', [])

        return {
            publicationId: result.id,
            type: 'Mirror',
            postId: result.id,
            timestamp,
            author: mirrorOnProfile,
            reporter: profile,
            isHidden: result.isDeleted,
            source: Social.Source.Lens,
            metadata: {
                content: {
                    ...content,
                    oembedUrl: last(oembedUrls),
                },
                contentURI: result.repostOf.snapshotUrl,
            },
            stats: {
                comments: result.repostOf.stats.comments,
                reposts: result.repostOf.stats.reposts,
                mirrors: result.repostOf.stats.reposts,
                quotes: result.repostOf.stats.quotes,
                reactions: result.repostOf.stats.upvotes,
                bookmarks: result.repostOf.stats.bookmarks,
                upvotes: result.repostOf.stats.upvotes,
                collects: result.repostOf.stats.collects,
            },
            canComment: result.repostOf.operations?.canComment.__typename === 'PostOperationValidationPassed',
            canMirror: result.repostOf.operations?.canRepost.__typename === 'PostOperationValidationPassed',
            hasMirrored: result.repostOf.operations?.hasReported,
            hasQuoted:
                result.repostOf.operations?.hasQuoted.optimistic || result.repostOf.operations?.hasQuoted.onChain,
            hasLiked: result.repostOf.operations?.hasUpvoted,
            hasBookmarked: result.repostOf.operations?.hasBookmarked,
            mentions: result.repostOf.mentions.map((x) => {
                if (x.__typename === 'AccountMention') return formatLensProfileByAccountMention(x.account)
                return formatLensProfileByGroupMention(x)
            }),
            collectModule: undefined,
            __original__: result,
            sendFrom:
                result.app?.address ?
                    {
                        displayName: result.app.metadata?.name,
                        name: result.app.metadata?.name,
                    }
                :   undefined,
        }
    }

    if (result.metadata.__typename === 'EventMetadata') throw new Error('Event not supported')

    const content = formatContent(result.metadata as ArticleMetadata | TextOnlyMetadata | ImageMetadata | EmbedMetadata)

    const oembedUrl: string | undefined = last(content?.oembedUrls || content?.content.match(URL_REGEX) || [])

    if (result.quoteOf) {
        return {
            publicationId: result.id,
            type: 'Quote',
            source: Social.Source.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            isHidden: result.isDeleted,
            metadata: {
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.snapshotUrl,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.reposts,
                reposts: result.stats.reposts,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                upvotes: result.stats.upvotes,
                collects: result.stats.collects,
            },
            __original__: result,
            canComment: result.operations?.canComment.__typename === 'PostOperationValidationPassed',
            canMirror: result.operations?.canRepost.__typename === 'PostOperationValidationPassed',
            hasMirrored: result.operations?.hasReported,
            hasQuoted: result.operations?.hasQuoted.optimistic || result.operations?.hasQuoted.onChain,
            hasLiked: result.operations?.hasUpvoted,
            hasBookmarked: result.operations?.hasBookmarked,
            quoteOn: formatLensQuoteOrComment(result.quoteOf),
            mentions: result.mentions.map((x) => {
                if (x.__typename === 'AccountMention') return formatLensProfileByAccountMention(x.account)
                return formatLensProfileByGroupMention(x)
            }),
            sendFrom: formatApp(result.app),
        }
    } else if (result.commentOn) {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Social.Source.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            isHidden: result.isDeleted,
            metadata: {
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.snapshotUrl,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.reposts,
                reposts: result.stats.reposts,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                upvotes: result.stats.upvotes,
                collects: result.stats.collects,
            },
            __original__: result,
            commentOn: formatLensQuoteOrComment(result.commentOn),
            canComment: result.operations?.canComment.__typename === 'PostOperationValidationPassed',
            canMirror: result.operations?.canRepost.__typename === 'PostOperationValidationPassed',
            hasMirrored: result.operations?.hasReposted.optimistic || result.operations?.hasReposted.onChain,
            hasQuoted: result.operations?.hasQuoted.optimistic || result.operations?.hasQuoted.onChain,
            hasLiked: result.operations?.hasUpvoted,
            hasBookmarked: result.operations?.hasBookmarked,
            mentions: result.mentions.map((x) => {
                if (x.__typename === 'AccountMention') return formatLensProfileByAccountMention(x.account)
                return formatLensProfileByGroupMention(x)
            }),
            sendFrom: formatApp(result.app),
        }
    } else {
        return {
            publicationId: result.id,
            type: 'Post',
            source: Social.Source.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            isHidden: result.isDeleted,
            metadata: {
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.snapshotUrl,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.reposts,
                reposts: result.stats.reposts,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                upvotes: result.stats.upvotes,
                collects: result.stats.collects,
            },
            canComment: result.operations?.canComment.__typename === 'PostOperationValidationPassed',
            canMirror: result.operations?.canRepost.__typename === 'PostOperationValidationPassed',
            hasMirrored: result.operations?.hasReposted.optimistic || result.operations?.hasReposted.onChain,
            hasQuoted: result.operations?.hasQuoted.optimistic || result.operations?.hasQuoted.onChain,
            hasLiked: result.operations?.hasUpvoted,
            hasBookmarked: result.operations?.hasBookmarked,
            mentions: result.mentions.map((x) => {
                if (x.__typename === 'AccountMention') return formatLensProfileByAccountMention(x.account)
                return formatLensProfileByGroupMention(x)
            }),
            __original__: result,
            sendFrom: formatApp(result.app),
        }
    }
}

/**
 * Returns the lenny avatar URL for the specified Lenny ID.
 * @param id The Lenny ID to get the URL for.
 * @returns The lenny avatar URL.
 */
export function getLennyUrl(id: string): string {
    return urlcat(FIREFLY_SITE_URL, '/api/avatar', { id })
}

export function formatLensProfileByAccountMention(result: AccountMention) {
    return {
        profileId: result.account as string,
        displayName: '',
        handle: '',
        fullHandle: '',
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: Social.ProfileStatus.Active,
        verified: true,
        source: Social.Source.Lens,
    }
}
export function formatLensProfileByGroupMention(result: GroupMention) {
    return {
        profileId: result.group as string,
        displayName: '',
        handle: '',
        fullHandle: '',
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: Social.ProfileStatus.Active,
        verified: true,
        source: Social.Source.Lens,
    }
}

export function formatImageUrl(url: string, name?: string) {
    if (!url) return ''

    if (url.startsWith(LENS_MEDIA_SNAPSHOT_URL)) {
        const splittedUrl = url.split('/')
        const path = splittedUrl.at(-1)
        return name ? `${LENS_MEDIA_SNAPSHOT_URL}/${name}/${path}` : url
    }

    return url
}

function formatContent(metadata: ArticleMetadata | TextOnlyMetadata | ImageMetadata | EmbedMetadata) {
    return {
        content: metadata.content,
        oembedUrls: getOembedUrls(metadata),
    }
}

function getOembedUrls(metadata: ArticleMetadata | TextOnlyMetadata | ImageMetadata | EmbedMetadata): string[] {
    if (metadata.__typename === 'TextOnlyMetadata') return []
    // Ignore unknown type at runtime.
    if (!['ArticleMetadata', 'ImageMetadata', 'EmbedMetadata'].includes(metadata.__typename)) {
        console.warn('Lens getOembedUrls: Unknown metadata type', metadata)
        return []
    }
    const urls = metadata.attachments.map((x) => x.item.toString() as string)
    return getEmbedUrls(metadata.content, urls).map((url) => {
        if (isValidPollFrameUrl(url)) return composePollFrameUrl(url, Social.Source.Lens)
        return url
    })
}

function formatLensQuoteOrComment(result: ReferencedPost): Social.Post {
    const profile = formatLensProfile(result.author)
    const timestamp = new Date(result.timestamp).getTime()

    const stats =
        result.__typename === 'Post' ?
            {
                comments: result.stats.comments,
                mirrors: result.stats.reposts,
                reposts: result.stats.reposts,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                upvotes: result.stats.upvotes,
                collects: result.stats.collects,
            }
        :   undefined

    return {
        publicationId: result.id,
        type: result.__typename,
        source: Social.Source.Lens,
        postId: result.id,
        timestamp,
        author: profile,
        isHidden: result.isDeleted,
        metadata: {
            content: formatContent(
                result.metadata as ArticleMetadata | TextOnlyMetadata | ImageMetadata | EmbedMetadata,
            ),
            contentURI: result.snapshotUrl,
        },
        canComment: result.operations?.canComment.__typename === 'PostOperationValidationPassed',
        canMirror: result.operations?.canRepost.__typename === 'PostOperationValidationPassed',
        hasMirrored: result.operations?.hasReposted.optimistic || result.operations?.hasReposted.onChain,
        hasQuoted: result.operations?.hasQuoted.optimistic || result.operations?.hasQuoted.onChain,
        hasLiked: result.operations?.hasUpvoted,
        hasBookmarked: result.operations?.hasBookmarked,
        stats,
        __original__: result,
        sendFrom: formatApp(result.app),
    }
}
