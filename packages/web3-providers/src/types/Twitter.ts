export namespace TwitterBaseAPI {
    export interface NFT {
        address: string
        token_id: string
    }

    export interface NFTContainer {
        has_nft_avatar: boolean
        nft_avatar_metadata: AvatarMetadata
    }

    export interface AvatarMetadata {
        token_id: string
        smart_contract: {
            __typename: 'ERC721' | 'ERC1155'
            __isSmartContract: 'ERC721'
            network: 'Ethereum'
            address: string
        }
        metadata: {
            creator_username: string
            creator_address: string
            name: string
            description?: string
            collection: {
                name: string
                metadata: {
                    image_url: string
                    verified: boolean
                    description: string
                    name: string
                }
            }
            traits: Array<{
                trait_type: string
                value: string
            }>
        }
    }

    export interface UserUrl {
        display_url: string
        expanded_url: string
        /** t.co url */
        url: string
        indices: [number, number]
    }
    export interface User {
        __typename: 'User'
        id: string
        rest_id: string
        affiliates_highlighted_label: {}
        has_nft_avatar: boolean
        legacy?: {
            id_str: string
            blocked_by: boolean
            blocking: boolean
            can_dm: boolean
            can_media_tag: boolean
            /** ISODateTime */
            created_at: string
            default_profile: boolean
            default_profile_image: boolean
            description: string
            entities: {
                description: {
                    urls: []
                }
                url: {
                    urls: UserUrl[]
                }
            }
            fast_followers_count: 0
            favourites_count: 22
            follow_request_sent: boolean
            followed_by: boolean
            followers_count: 35
            following: boolean
            friends_count: 76
            has_custom_timelines: boolean
            is_translator: boolean
            listed_count: 4
            location: string
            media_count: 196
            muting: boolean
            name: string
            normal_followers_count: 35
            notifications: boolean
            pinned_tweet_ids_str: []
            possibly_sensitive: boolean
            /** unused data, declare details when you need */
            profile_banner_extensions: any
            profile_banner_url: string
            /** unused data, declare details when you need */
            profile_image_extensions: any
            profile_image_url_https: string
            profile_interstitial_type: string
            protected: boolean
            screen_name: string
            statuses_count: number
            translator_type: string
            /** t.co url */
            url: string
            verified: boolean
            want_retweets: boolean
            withheld_in_countries: []
        }
        smart_blocked_by: false
        smart_blocking: false
        super_follow_eligible: false
        super_followed_by: false
        super_following: false
        legacy_extended_profile: {}
        is_profile_translatable: boolean
    }

    export interface AvatarInfo {
        nickname: string
        userId: string
        imageUrl: string
        mediaId: string
    }

    export enum Scale {
        X_Small = 'xSmall',
        Small = 'small',
        Normal = 'normal',
        Large = 'large',
        X_Large = 'xLarge',
    }

    export enum ThemeMode {
        Dark = 'darker',
        Dim = 'dark',
        Light = 'light',
    }

    export enum ThemeColor {
        Blue = 'blue500',
        Yellow = 'yellow500',
        Purple = 'purple500',
        Magenta = 'magenta500',
        Orange = 'orange500',
        Green = 'green500',
    }

    export interface Settings {
        screen_name: string
    }

    export interface UserSettings {
        altTextNudgeType?: string
        autoPollNewTweets?: boolean
        autoShowNewTweets?: boolean
        highContrastEnabled?: boolean
        loginPromptLastShown?: number
        /* cspell:disable-next-line */
        nextPushCheckin?: number
        preciseLocationEnabled?: boolean
        pushNotificationsPermission?: 'granted'
        reducedMotionEnabled?: boolean
        replyVotingSurveyClicked?: number
        scale?: Scale
        shouldAutoPlayGif?: boolean
        shouldAutoTagLocation?: boolean
        showTweetMediaDetailDrawer?: boolean
        themeBackground?: ThemeMode
        themeColor?: ThemeColor
    }

    export interface TwitterResult {
        media_id: number
        media_id_string: string
        size: number
        image: {
            image_type: string
            w: number
            h: number
        }
    }

    export type Event<T> = {
        target: {
            result: T
        }
    }

    export type Response<T> = {
        data: T
    }

    export type UserByScreenNameResponse = Response<{ user: { result: User } }>

    export interface Provider {
        getSettings: () => Promise<Settings | undefined>
        getUserSettings: () => Promise<UserSettings>
        getUserByScreenName: (screenName: string) => Promise<User | null>
        getUserNftContainer: (screenName: string) => Promise<NFT | undefined>
        uploadUserAvatar: (screenName: string, image: Blob | File) => Promise<TwitterResult>
        updateProfileImage: (screenName: string, media_id_str: string) => Promise<AvatarInfo | undefined>
        staleUserByScreenName: (screenName: string) => Promise<User | null>
    }
}
