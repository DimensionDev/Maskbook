import { Social, FireflyFarcasterAPI } from '@masknet/web3-providers/types'
import { compact, first, last, uniqBy } from 'lodash-es'
import { EMAIL_REGEX, URL_REGEX } from './constants.js'
import { composePollFrameUrl, isValidPollFrameUrl, resolveEmbedMediaType } from '../helpers/social.js'
import { isTopLevelDomain, parseUrl } from '../helpers/url.js'

export function resolveFireflyResponseData<T>({ data, error }: FireflyFarcasterAPI.Response<T>): T {
    if (error) {
        const errorMsg =
            Array.isArray(error) ? first(error)
            : typeof error === 'string' ? error
            : undefined
        throw new Error(errorMsg || 'Unknown error')
    }
    return data as T
}

function getPostTypeByCast(cast: FireflyFarcasterAPI.Cast) {
    if (cast.quotedCast) return 'Quote'
    if (cast.recastedBy) return 'Mirror'
    if (cast.parentCast) return 'Comment'
    return 'Post'
}

/**
 * Return null if cast is detected
 */
export function formatFarcasterPostFromFirefly(cast: FireflyFarcasterAPI.Cast, type?: Social.PostType): Social.Post {
    const postType = type ?? getPostTypeByCast(cast)
    return {
        publicationId: cast.hash,
        type: postType,
        postId: cast.hash,
        parentPostId: cast.parent_hash,
        parentAuthor: cast.parentCast?.author ? formatFarcasterProfileFromFirefly(cast.parentCast?.author) : undefined,
        timestamp: cast.timestamp ? new Date(cast.timestamp).getTime() : undefined,
        author:
            cast.author ? formatFarcasterProfileFromFirefly(cast.author) : createDummyProfile(Social.Source.Farcaster),
        isHidden: !!cast.deleted_at,
        metadata: {
            locale: '',
            content: formatContent(cast),
        },
        stats: {
            comments: Number(cast.replyCount),
            mirrors: cast.recastCount,
            quotes: cast.quotedCount,
            reactions: cast.likeCount,
        },
        mentions: cast.mentions_user.map<Social.Profile>((x) => {
            return {
                profileId: x.fid,
                displayName: x.handle,
                handle: x.handle,
                fullHandle: x.handle,
                pfp: '',
                source: Social.Source.Farcaster,
                followerCount: 0,
                followingCount: 0,
                status: Social.ProfileStatus.Active,
                verified: true,
            }
        }),
        mirrors: cast.recastedBy ? [formatFarcasterProfileFromFirefly(cast.recastedBy)] : undefined,
        hasLiked: cast.liked,
        hasMirrored: cast.recasted,
        hasBookmarked: cast.bookmarked,
        source: Social.Source.Farcaster,
        canComment: true,
        commentOn: cast.parentCast ? formatFarcasterPostFromFirefly(cast.parentCast) : undefined,
        root: cast.rootParentCast ? formatFarcasterPostFromFirefly(cast.rootParentCast) : undefined,
        threads: compact(cast.threads?.map((x) => formatFarcasterPostFromFirefly(x, 'Comment'))),
        channel: cast.channel ? formatChannelFromFirefly(cast.channel) : undefined,
        quoteOn: cast.quotedCast ? formatFarcasterPostFromFirefly(cast.quotedCast) : undefined,
        sendFrom: {
            displayName: cast.sendFrom?.display_name ?? cast.sendFrom?.name,
            name: cast.sendFrom?.name,
        },
        __original__: cast,
    }
}

function getCoverUriFromUrl(url: string) {
    const parsed = parseUrl(url)
    if (!parsed) return ''

    if (parsed.origin === 'https://media.firefly.land' && url.endsWith('.m3u8')) {
        return url.replace(/[^/]+\.m3u8$/, 'thumbnail.jpg')
    }

    return ''
}

function formatContent(cast: FireflyFarcasterAPI.Cast): Social.Post['metadata']['content'] {
    const embedUrls: Array<{ url: string; type?: FireflyFarcasterAPI.EmbedMediaType }> =
        cast.embed_urls?.length ? cast.embed_urls : cast.embeds

    const oembedUrls = getEmbedUrls(
        cast.text,
        compact(
            embedUrls
                ?.filter((x) =>
                    x.type ?
                        [FireflyFarcasterAPI.EmbedMediaType.TEXT, FireflyFarcasterAPI.EmbedMediaType.FRAME].includes(
                            x.type,
                        )
                    :   true,
                )
                .map((x) => x.url),
        ),
    )
        .map((x) => {
            if (isValidPollFrameUrl(x)) return composePollFrameUrl(x, Social.Source.Farcaster)
            return x
        })
        .filter(isTopLevelDomain)

    const defaultContent = { content: cast.text, oembedUrl: last(oembedUrls), oembedUrls }

    const attachments = embedUrls.filter((x) => {
        if (!x.url) return false
        const type = resolveEmbedMediaType(x.url, x.type)
        if (!type) return false
        return true
    })

    if (attachments.length) {
        const lastAsset = last(attachments)
        if (!lastAsset?.url) return defaultContent
        const assetType = resolveEmbedMediaType(lastAsset.url, lastAsset.type)
        if (!assetType) return defaultContent
        return {
            content: cast.text.replace(lastAsset.url, ''),
            oembedUrl: last(oembedUrls),
            oembedUrls,
            asset: {
                type: assetType,
                uri: lastAsset.url,
                coverUri: getCoverUriFromUrl(lastAsset.url),
            } satisfies Social.Attachment,
            attachments: compact<Social.Attachment>(
                attachments.map((x) => {
                    if (!x.url) return

                    const type = resolveEmbedMediaType(x.url, x.type)
                    if (!type) return

                    return {
                        type,
                        uri: x.url,
                        coverUri: getCoverUriFromUrl(x.url),
                    }
                }),
            ),
        }
    }
    return defaultContent
}

export function formatFarcasterProfileFromFirefly(user: FireflyFarcasterAPI.User): Social.Profile {
    return {
        fullHandle: user.username || user.display_name,
        profileId: user.fid,
        handle: user.username,
        displayName: user.display_name,
        pfp: user.pfp,
        bio: user.bio,
        address: first(user.addresses),
        followerCount: user.followers,
        followingCount: user.following,
        status: Social.ProfileStatus.Active,
        verified: true,
        source: Social.Source.Farcaster,
        viewerContext: {
            following: user.isFollowing,
            followedBy: user.isFollowedBack,
        },
        isPowerUser: user.isPowerUser ?? false,
    }
}

export function formatChannelFromFirefly(channel: FireflyFarcasterAPI.Channel): Social.Channel {
    const createdAt = channel.createdAt ?? channel.created_at ?? 0

    const formatted: Social.Channel = {
        source: Social.Source.Farcaster,
        id: channel.id,
        name: channel.name,
        description: channel.description,
        imageUrl: channel.image_url,
        url: channel.url,
        parentUrl: channel.parent_url,
        followerCount: channel.follower_count ?? 0,
        timestamp: createdAt * 1000,
        __original__: channel,
    }
    if (channel.lead) {
        formatted.lead = formatChannelProfileFromFirefly(channel.lead)
    }
    if (channel.hosts?.length) {
        formatted.hosts = channel.hosts.map(formatChannelProfileFromFirefly)
    }
    return formatted
}

export function formatChannelProfileFromFirefly(channelProfile: FireflyFarcasterAPI.ChannelProfile): Social.Profile {
    return {
        profileId: channelProfile.fid.toString(),
        displayName: channelProfile.display_name,
        handle: channelProfile.username,
        fullHandle: channelProfile.username,
        pfp: channelProfile.pfp_url,
        bio: channelProfile.profile?.bio?.text,
        address: channelProfile.custody_address,
        followerCount: channelProfile.follower_count,
        followingCount: channelProfile.following_count,
        status: channelProfile.active_status === 'active' ? Social.ProfileStatus.Active : Social.ProfileStatus.Inactive,
        verified: !!channelProfile.verifications && channelProfile.verifications.length > 0,
        viewerContext: {
            following: channelProfile.isFollowing ?? false,
            followedBy: channelProfile.isFollowedBack ?? false,
        },
        source: Social.Source.Farcaster,
    }
}

export function createDummyProfile(source: Social.SocialSource) {
    return {
        source,
        profileId: '',
        handle: '',
        pfp: '',
        displayName: '',
        followerCount: 0,
        followingCount: 0,
        fullHandle: '',
        status: Social.ProfileStatus.Active,
        verified: true,
    } satisfies Social.Profile
}

export function createDummyProfileFromFireflyAccountId(accountId: string) {
    return {
        ...createDummyProfile(Social.Source.Farcaster),
        profileId: accountId,
    }
}

export function createDummyProfileFromLensHandle(handle: string) {
    return {
        ...createDummyProfile(Social.Source.Lens),
        handle,
    }
}

function fixUrls(urls: Array<string | undefined>) {
    return uniqBy(compact(urls), (x) => x).map(fixUrlProtocol)
}

const emailRegExp = new RegExp(EMAIL_REGEX, 'g')

const BLOCKED_URLS = ['imagedelivery.net']

export function getEmbedUrls(content: string, embedUrls: string[]) {
    const matchedUrls = fixUrls([...content.replaceAll(emailRegExp, '').matchAll(URL_REGEX)].map((x) => x[0]))
    const oembedUrls = fixUrls([...matchedUrls, ...embedUrls])
    return oembedUrls.filter((x) => !BLOCKED_URLS.some((y) => x.includes(y)))
}
export function fixUrlProtocol(url: string) {
    if (url.match(/^https?:\/\//)) {
        return url
    }
    return `https://${url}`
}
