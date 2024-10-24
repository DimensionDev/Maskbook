// cspell:ignore ment,agment,ment,Multirecipient
import type {
    AnyPublicationFragment,
    ArticleMetadataV3Fragment,
    AudioMetadataV3Fragment,
    CheckingInMetadataV3Fragment,
    CommentBaseFragment,
    EmbedMetadataV3Fragment,
    EventMetadataV3Fragment,
    HandleInfoFragment,
    ImageMetadataV3Fragment,
    LegacyAaveFeeCollectModuleSettingsFragment,
    LegacyErc4626FeeCollectModuleSettingsFragment,
    LegacyFeeCollectModuleSettingsFragment,
    LegacyFreeCollectModuleSettingsFragment,
    LegacyLimitedFeeCollectModuleSettingsFragment,
    LegacyLimitedTimedFeeCollectModuleSettingsFragment,
    LegacyMultirecipientFeeCollectModuleSettingsFragment,
    LegacyRevertCollectModuleSettingsFragment,
    LegacySimpleCollectModuleSettingsFragment,
    LegacyTimedFeeCollectModuleSettingsFragment,
    LinkMetadataV3Fragment,
    LiveStreamMetadataV3Fragment,
    MintMetadataV3Fragment,
    MultirecipientFeeCollectOpenActionSettingsFragment,
    PostFragment,
    ProfileFragment,
    PublicationMetadataFragment,
    PublicationMetadataMediaFragment,
    QuoteBaseFragment,
    SimpleCollectOpenActionSettingsFragment,
    SpaceMetadataV3Fragment,
    StoryMetadataV3Fragment,
    TextOnlyMetadataV3Fragment,
    ThreeDMetadataV3Fragment,
    TransactionMetadataV3Fragment,
    UnknownOpenActionModuleSettingsFragment,
    VideoMetadataV3Fragment,
} from '@lens-protocol/client'
import { safeUnreachable } from '@masknet/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Social } from '@masknet/web3-providers/types'
import { compact, first, isEmpty, last } from 'lodash-es'
import urlcat from 'urlcat'
import { URL_REGEX } from '../Firefly/constants.js'
import { getEmbedUrls } from '../Firefly/helpers.js'
import { FIREFLY_SITE_URL } from '../helpers/constant.js'
import { composePollFrameUrl, getPollFrameUrl, isValidPollFrameUrl } from '../helpers/social.js'
import { parseUrl, sanitizeDStorageUrl } from '../helpers/url.js'
import { LENS_MEDIA_SNAPSHOT_URL } from './constants.js'

const PLACEHOLDER_IMAGE = 'https://static-assets.hey.xyz/images/placeholder.webp'
const allowedTypes = ['SimpleCollectOpenActionModule', 'MultirecipientFeeCollectOpenActionModule']

function getAvatar(profile: ProfileFragment, namedTransform = 'tr:w-300,h-300') {
    let avatarUrl = (profile as { avatar?: string }).avatar

    if (profile?.metadata?.picture?.__typename === 'NftImage') {
        avatarUrl = profile.metadata.picture.image.optimized?.uri ?? profile.metadata.picture.image.raw.uri
    } else if (profile.metadata?.picture?.__typename === 'ImageSet') {
        avatarUrl = profile.metadata.picture.optimized?.uri ?? profile.metadata.picture.raw.uri
    } else {
        avatarUrl = getLennyUrl(profile.id)
    }

    return formatImageUrl(sanitizeDStorageUrl(avatarUrl), namedTransform)
}

export function formatLensProfile(result: ProfileFragment): Social.Profile {
    return {
        profileId: result.id,
        displayName: result.metadata?.displayName || result.handle?.localName || '',
        handle: (result.handle?.localName || result.metadata?.displayName) ?? '',
        fullHandle: result.handle?.fullHandle || '',
        pfp: getAvatar(result),
        bio: result.metadata?.bio ?? undefined,
        address: result.followNftAddress?.address ?? undefined,
        followerCount: result.stats.followers,
        followingCount: result.stats.following,
        status: Social.ProfileStatus.Active,
        verified: true,
        signless: result.signless,
        ownedBy: {
            networkType: Social.NetworkType.Ethereum,
            address: result.ownedBy.address,
        },
        viewerContext: {
            following: result.operations.isFollowedByMe.value,
            followedBy: result.operations.isFollowingMe.value,
            blocking: result.operations.isBlockedByMe.value,
        },
        source: Social.Source.Lens,
        website: result.metadata?.attributes?.find((x) => x.key === 'website')?.value,
        location: result.metadata?.attributes?.find((x) => x.key === 'location')?.value,
    }
}

export function formatLensPost(result: AnyPublicationFragment): Social.Post {
    const profile = formatLensProfile(result.by)
    const timestamp = new Date(result.createdAt).getTime()

    if (result.__typename === 'Mirror') {
        const mediaObjects = getMediaObjects(result.mirrorOn.metadata)
        const mirrorOnProfile = formatLensProfile(result.mirrorOn.by)
        const content = formatContent(result.mirrorOn.metadata, mirrorOnProfile)
        const oembedUrls = getEmbedUrls(content?.content ?? '', [])

        const canAct =
            !!result.mirrorOn.openActionModules?.length &&
            result.mirrorOn.openActionModules?.some((openAction) => allowedTypes.includes(openAction.type))

        return {
            publicationId: result.id,
            type: result.__typename,
            postId: result.mirrorOn.id,
            timestamp,
            author: mirrorOnProfile,
            reporter: profile,
            isHidden: result.mirrorOn.isHidden,
            source: Social.Source.Lens,
            mediaObjects,
            metadata: {
                locale: result.mirrorOn.metadata.locale,
                content: {
                    ...content,
                    oembedUrl: last(oembedUrls),
                },
                contentURI: result.mirrorOn.metadata.rawURI,
            },
            stats: {
                comments: result.mirrorOn.stats.comments,
                mirrors: result.mirrorOn.stats.mirrors,
                quotes: result.mirrorOn.stats.quotes,
                reactions: result.mirrorOn.stats.upvotes,
                bookmarks: result.mirrorOn.stats.bookmarks,
                countOpenActions: result.mirrorOn.stats.countOpenActions,
            },
            canComment: result.mirrorOn.operations.canComment === 'YES',
            canMirror: result.mirrorOn.operations.canMirror === 'YES',
            hasMirrored: result.mirrorOn.operations.hasMirrored,
            hasQuoted: result.mirrorOn.operations.hasQuoted,
            hasActed: result.mirrorOn.operations.hasActed.value,
            hasLiked: result.mirrorOn.operations.hasUpvoted,
            hasBookmarked: result.mirrorOn.operations.hasBookmarked,
            mentions: result.mirrorOn.profilesMentioned.map((x) =>
                formatLensProfileByHandleInfo(x.snapshotHandleMentioned),
            ),
            canAct,
            collectModule:
                canAct ?
                    formatCollectModule(result.mirrorOn.openActionModules, result.mirrorOn.stats.countOpenActions)
                :   undefined,
            __original__: result,
            sendFrom:
                result.publishedOn?.id ?
                    {
                        displayName: result.publishedOn.id,
                        name: result.publishedOn.id,
                    }
                :   undefined,
            momoka: result.mirrorOn.momoka || undefined,
        }
    }

    if (result.metadata.__typename === 'EventMetadataV3') throw new Error('Event not supported')
    const mediaObjects = getMediaObjects(result.metadata)

    const content = formatContent(result.metadata, profile)

    const oembedUrl = last(content?.oembedUrls || content?.content.match(URL_REGEX) || [])

    const canAct =
        !!result.openActionModules?.length &&
        result.openActionModules?.some((openAction) => allowedTypes.includes(openAction.type))

    if (result.__typename === 'Quote') {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Social.Source.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            mediaObjects,
            isHidden: result.isHidden,
            isEncrypted: !!result.metadata.encryptedWith,
            metadata: {
                locale: result.metadata.locale,
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.metadata.rawURI,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.mirrors,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            },
            __original__: result,
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            hasQuoted: result.operations.hasQuoted,
            hasActed: result.operations.hasActed.value,
            hasLiked: result.operations.hasUpvoted,
            hasBookmarked: result.operations.hasBookmarked,
            quoteOn: formatLensQuoteOrComment(result.quoteOn),
            mentions: result.profilesMentioned.map((x) => formatLensProfileByHandleInfo(x.snapshotHandleMentioned)),
            canAct,
            collectModule:
                canAct ? formatCollectModule(result.openActionModules, result.stats.countOpenActions) : undefined,
            momoka: result.momoka || undefined,
            sendFrom:
                result.publishedOn?.id ?
                    {
                        displayName: result.publishedOn.id,
                        name: result.publishedOn.id,
                    }
                :   undefined,
        }
    } else if (result.__typename === 'Comment') {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Social.Source.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            mediaObjects,
            isHidden: result.isHidden,
            isEncrypted: !!result.metadata.encryptedWith,
            metadata: {
                locale: result.metadata.locale,
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.metadata.rawURI,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.mirrors,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            },
            __original__: result,
            commentOn: formatLensQuoteOrComment(result.commentOn),
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            hasQuoted: result.operations.hasQuoted,
            hasActed: result.operations.hasActed.value,
            hasLiked: result.operations.hasUpvoted,
            hasBookmarked: result.operations.hasBookmarked,
            firstComment: result.firstComment ? formatLensQuoteOrComment(result.firstComment) : undefined,
            mentions: result.profilesMentioned.map((x) => formatLensProfileByHandleInfo(x.snapshotHandleMentioned)),
            root:
                result.root && !isEmpty(result.root) && (result.root as PostFragment).id !== result.commentOn.id ?
                    formatLensPost(result.root as PostFragment)
                :   undefined,
            canAct,
            collectModule:
                canAct ? formatCollectModule(result.openActionModules, result.stats.countOpenActions) : undefined,
            momoka: result.momoka || undefined,
            sendFrom:
                result.publishedOn?.id ?
                    {
                        displayName: result.publishedOn.id,
                        name: result.publishedOn.id,
                    }
                :   undefined,
        }
    } else {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Social.Source.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            mediaObjects,
            isHidden: result.isHidden,
            isEncrypted: !!result.metadata.encryptedWith,
            metadata: {
                locale: result.metadata.locale,
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.metadata.rawURI,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.mirrors,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            },
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            canAct,
            collectModule:
                canAct ? formatCollectModule(result.openActionModules, result.stats.countOpenActions) : undefined,
            hasActed: result.operations.hasActed.value,
            hasMirrored: result.operations.hasMirrored,
            hasQuoted: result.operations.hasQuoted,
            hasLiked: result.operations.hasUpvoted,
            hasBookmarked: result.operations.hasBookmarked,
            mentions: result.profilesMentioned.map((x) => formatLensProfileByHandleInfo(x.snapshotHandleMentioned)),
            __original__: result,
            momoka: result.momoka || undefined,
            sendFrom:
                result.publishedOn?.id ?
                    {
                        displayName: result.publishedOn.id,
                        name: result.publishedOn.id,
                    }
                :   undefined,
        }
    }
}

function getMediaObjects(
    metadata:
        | ArticleMetadataV3Fragment
        | AudioMetadataV3Fragment
        | CheckingInMetadataV3Fragment
        | EmbedMetadataV3Fragment
        | EventMetadataV3Fragment
        | ImageMetadataV3Fragment
        | LinkMetadataV3Fragment
        | LiveStreamMetadataV3Fragment
        | MintMetadataV3Fragment
        | SpaceMetadataV3Fragment
        | StoryMetadataV3Fragment
        | TextOnlyMetadataV3Fragment
        | ThreeDMetadataV3Fragment
        | TransactionMetadataV3Fragment
        | VideoMetadataV3Fragment,
) {
    return metadata.__typename !== 'StoryMetadataV3' && metadata.__typename !== 'TextOnlyMetadataV3' ?
            metadata.attachments?.map((attachment) => {
                const type = attachment.__typename
                switch (type) {
                    case 'PublicationMetadataMediaAudio':
                        return {
                            url: attachment.audio.raw.uri,
                            mimeType: attachment.audio.raw.mimeType || 'audio/*',
                        }
                    case 'PublicationMetadataMediaImage':
                        return {
                            url: attachment.image.raw.uri,
                            mimeType: attachment.image.raw.mimeType || 'image/*',
                        }
                    case 'PublicationMetadataMediaVideo':
                        return {
                            url: attachment.video.raw.uri,
                            mimeType: attachment.video.raw.mimeType || 'video/*',
                        }
                    default:
                        safeUnreachable(type)
                        return {
                            url: '',
                            mimeType: '',
                        }
                }
            }) ?? undefined
        :   undefined
}

function formatCollectModule(
    openActions: Array<
        // cspell: disable-next-line
        | LegacyAaveFeeCollectModuleSettingsFragment
        | LegacyErc4626FeeCollectModuleSettingsFragment
        | LegacyFeeCollectModuleSettingsFragment
        | LegacyFreeCollectModuleSettingsFragment
        | LegacyLimitedFeeCollectModuleSettingsFragment
        | LegacyLimitedTimedFeeCollectModuleSettingsFragment
        | LegacyMultirecipientFeeCollectModuleSettingsFragment
        | LegacyRevertCollectModuleSettingsFragment
        | LegacySimpleCollectModuleSettingsFragment
        | LegacyTimedFeeCollectModuleSettingsFragment
        | MultirecipientFeeCollectOpenActionSettingsFragment
        | SimpleCollectOpenActionSettingsFragment
        | UnknownOpenActionModuleSettingsFragment
    >,
    count: number,
) {
    const openAction = first(openActions) as
        | MultirecipientFeeCollectOpenActionSettingsFragment
        | SimpleCollectOpenActionSettingsFragment
        | undefined

    return {
        collectedCount: count,
        collectLimit: Number.parseInt(openAction?.collectLimit || '0', 10),
        currency: openAction?.amount?.asset.symbol,
        assetAddress: openAction?.amount?.asset.contract.address,
        usdPrice: openAction?.amount?.asFiat?.value,
        amount: Number.parseFloat(openAction?.amount?.value || '0'),
        referralFee: openAction?.referralFee,
        followerOnly: openAction?.followerOnly,
        contract: {
            address: openAction?.contract.address,
            chainId: openAction?.contract.chainId,
        },
        endsAt: openAction?.endsAt,
        type: openAction?.type,
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

export function formatLensProfileByHandleInfo(result: HandleInfoFragment): Social.Profile {
    return {
        profileId: result.id,
        displayName: result.localName || '',
        handle: result.localName || '',
        fullHandle: result.fullHandle || '',
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

function formatContent(metadata: PublicationMetadataFragment, author: Social.Profile) {
    const type = metadata.__typename
    switch (type) {
        case 'ArticleMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            }
        case 'TextOnlyMetadataV3':
            return {
                content: metadata.content,
                oembedUrls: getOembedUrls(metadata, author),
            }
        case 'LinkMetadataV3':
            const parsedLink = parseUrl(metadata.sharingLink)
            return {
                content: metadata.content,
                oembedUrls: getEmbedUrls(
                    metadata.content,
                    parsedLink ?
                        isValidPollFrameUrl(parsedLink.toString()) ?
                            [composePollFrameUrl(parsedLink.toString(), Social.Source.Lens)]
                        :   [parsedLink.toString()]
                    :   [],
                ),
            }
        case 'ImageMetadataV3': {
            const asset =
                metadata.asset.image.optimized?.uri ?
                    ({
                        uri: metadata.asset.image.optimized?.uri,
                        type: 'Image',
                    } satisfies Social.Attachment)
                :   undefined

            return {
                content: metadata.content,
                asset,
                attachments:
                    metadata.attachments?.length ? getAttachments(metadata.attachments)
                    : asset ? [asset]
                    : [],
            }
        }
        case 'AudioMetadataV3': {
            const audioAttachments = getAttachments(metadata.attachments)[0]
            const asset = {
                uri: metadata.asset.audio.optimized?.uri || audioAttachments?.uri,
                coverUri: metadata.asset.cover?.optimized?.uri || audioAttachments?.coverUri || PLACEHOLDER_IMAGE,
                artist: metadata.asset.artist || audioAttachments?.artist,
                title: metadata.title,
                type: 'Audio',
            } satisfies Social.Attachment

            return {
                content: metadata.content,
                asset,
                attachments: [asset],
            }
        }
        case 'VideoMetadataV3': {
            const videoAttachments = getAttachments(metadata.attachments)[0]
            const asset = {
                uri: metadata.asset.video.optimized?.uri || videoAttachments?.uri,
                coverUri: metadata.asset.cover?.optimized?.uri || videoAttachments?.coverUri || PLACEHOLDER_IMAGE,
                type: 'Video',
            } satisfies Social.Attachment

            return {
                content: metadata.content,
                asset,
                attachments: [asset],
            }
        }
        case 'MintMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            }
        case 'EmbedMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            }
        case 'LiveStreamMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            }
        case 'CheckingInMetadataV3':
            return null
        case 'EventMetadataV3':
            return null
        case 'SpaceMetadataV3':
            return null
        case 'StoryMetadataV3':
            return null
        case 'ThreeDMetadataV3':
            return null
        case 'TransactionMetadataV3':
            return null
        default:
            safeUnreachable(type)
            return null
    }
}

function getOembedUrls(
    metadata: LinkMetadataV3Fragment | TextOnlyMetadataV3Fragment,
    author: Social.Profile,
): string[] {
    return getEmbedUrls(
        metadata.content,
        metadata.attributes?.reduce<string[]>((acc, attr) => {
            if (attr.key === Social.LensMetadataAttributeKey.Poll) {
                acc.push(getPollFrameUrl(attr.value, undefined, author))
            }
            return acc
        }, []) ?? [],
    ).map((url) => {
        if (isValidPollFrameUrl(url)) return composePollFrameUrl(url, Social.Source.Lens)
        return url
    })
}

function getAttachments(attachments?: PublicationMetadataMediaFragment[] | null): Social.Attachment[] {
    if (!attachments) return EMPTY_LIST

    return compact<Social.Attachment>(
        attachments.map((attachment) => {
            const type = attachment.__typename
            switch (type) {
                case 'PublicationMetadataMediaImage':
                    if (attachment.image.optimized?.uri) {
                        return {
                            uri: attachment.image.optimized?.uri,
                            type: 'Image',
                        }
                    }
                    return
                case 'PublicationMetadataMediaVideo':
                    if (attachment.video.optimized?.uri) {
                        return {
                            uri: attachment.video.optimized?.uri,
                            coverUri: attachment.cover?.optimized?.uri,
                            type: 'Video',
                        }
                    }
                    return
                case 'PublicationMetadataMediaAudio':
                    if (attachment.audio.optimized?.uri) {
                        return {
                            uri: attachment.audio.optimized?.uri,
                            coverUri: attachment.cover?.optimized?.uri,
                            artist: attachment.artist ?? undefined,
                            type: 'Audio',
                        }
                    }
                    return
                default:
                    safeUnreachable(type)
                    return
            }
        }),
    )
}

function formatLensQuoteOrComment(result: CommentBaseFragment | PostFragment | QuoteBaseFragment): Social.Post {
    const profile = formatLensProfile(result.by)
    const timestamp = new Date(result.createdAt).getTime()

    const mediaObjects = getMediaObjects(result.metadata)

    const stats =
        result.__typename === 'Post' ?
            {
                comments: result.stats.comments,
                mirrors: result.stats.mirrors,
                quotes: result.stats.quotes,
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            }
        :   undefined

    return {
        publicationId: result.id,
        type: result.__typename,
        source: Social.Source.Lens,
        postId: result.id,
        timestamp,
        author: profile,
        mediaObjects,
        isHidden: result.isHidden,
        isEncrypted: !!result.metadata.encryptedWith,
        metadata: {
            locale: result.metadata.locale,
            content: formatContent(result.metadata, profile),
            contentURI: result.metadata.rawURI,
        },
        canComment: result.operations.canComment === 'YES',
        canMirror: result.operations.canMirror === 'YES',
        hasMirrored: result.operations.hasMirrored,
        hasQuoted: result.operations.hasQuoted,
        hasActed: result.operations.hasActed.value,
        hasLiked: result.operations.hasUpvoted,
        hasBookmarked: result.operations.hasBookmarked,
        stats,
        __original__: result,
        momoka: result.momoka || undefined,
        sendFrom:
            result.publishedOn?.id ?
                {
                    displayName: result.publishedOn.id,
                    name: result.publishedOn.id,
                }
            :   undefined,
    }
}
