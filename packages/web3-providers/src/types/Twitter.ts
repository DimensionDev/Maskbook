export namespace TwitterBaseAPI {
    export interface NFT {
        address: string
        token_id: string
    }

    export interface NFTContainer {
        has_nft_avatar: boolean
        nft_avatar_metadata: AvatarMetadata
    }

    export interface UserNFTAvatarResponse {
        data: {
            // If user doesn't exist, instead of 404 response, user field will miss
            user?: {
                result: UserNFTAvatar
            }
        }
    }
    export interface UserNFTAvatar {
        has_nft_avatar: boolean
        id: string
        is_blue_verified: boolean
        legacy: Pick<
            IdentifyResponse,
            'id' | 'id_str' | 'name' | 'screen_name' | 'verified' | 'profile_image_url_https'
        > & {
            profile_image_extensions: {
                mediaColor: {
                    r: {
                        ok: {
                            palette: Array<{
                                /** @example 42 */
                                percentage: number
                                rgb: { red: number; blue: number; green: number }
                            }>
                        }
                    }
                }
            }
        }
        nft_avatar_metadata: AvatarMetadata
    }

    export interface AvatarMetadata {
        token_id: string
        smart_contract: {
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
        id: string
        rest_id: string
        affiliates_highlighted_label: {}
        /** Only web API provides */
        has_nft_avatar?: boolean
        legacy?: {
            blocked_by?: boolean
            blocking?: boolean
            can_dm?: boolean
            can_media_tag?: boolean
            /** ISODateTime */
            created_at: string
            default_profile: boolean
            default_profile_image: boolean
            description: string
            entities: {
                description: {
                    urls: any[]
                }
                url: {
                    urls: UserUrl[]
                }
            }
            fast_followers_count?: number
            favourites_count: number
            follow_request_sent: boolean | null
            followed_by?: boolean
            followers_count: number
            following: boolean | null
            friends_count: number
            has_custom_timelines: boolean
            is_translator: boolean
            listed_count: number
            location: string
            media_count: number
            muting?: boolean
            name: string
            normal_followers_count?: number
            notifications: boolean | null
            pinned_tweet_ids_str?: []
            possibly_sensitive?: boolean
            /** unused data, declare details when you need */
            profile_banner_extensions?: any
            profile_banner_url: string
            /** unused data, declare details when you need */
            profile_image_extensions?: any
            profile_image_url_https: string
            profile_interstitial_type?: string
            protected: boolean
            screen_name: string
            statuses_count: number
            translator_type: string
            /** t.co url */
            url: string
            verified: boolean
            want_retweets?: boolean
            withheld_in_countries: []
        }
        smart_blocked_by?: boolean
        smart_blocking?: boolean
        super_follow_eligible?: boolean
        super_followed_by?: boolean
        super_following?: boolean
        legacy_extended_profile?: {}
        is_profile_translatable?: boolean
    }

    export type Response<T> = {
        data: T
    }

    export interface ResponseError {
        code: number
        extensions: ResponseError
        kind: 'Validation' | string
        message: string
        /** Error constructor */
        name: string
        source: 'Client' | string
        tracking: {
            trace_id: string
        }
    }
    export interface IdentifyResponse {
        id: number
        id_str: string
        name: string
        screen_name: string
        location: string
        profile_location: null
        /** bio */
        description: string
        url: string
        entities: {
            description: {
                urls: any[]
            }
            url: {
                urls: UserUrl[]
            }
        }
        protected: boolean
        followers_count: number
        friends_count: number
        listed_count: number
        /** @example Mon May 15 06:29:53 +0000 2017 */
        created_at: string
        favourites_count: number
        utc_offset: null
        time_zone: null
        geo_enabled: boolean
        verified: boolean
        statuses_count: number
        media_count: number
        lang: null
        status: {
            /** @example Mon May 15 06:29:53 +0000 2017 */
            created_at: string
            id: number
            id_str: string
            text: string
            truncated: boolean
            entities: {
                hashtags: []
                symbols: []
                user_mentions: []
                urls: Array<{
                    url: string
                    expanded_url: string
                    display_url: string
                    indices: number[]
                }>
            }
            source: string
            in_reply_to_status_id: number
            in_reply_to_status_id_str: string
            in_reply_to_user_id: number
            in_reply_to_user_id_str: string
            in_reply_to_screen_name: string
            geo: null
            coordinates: null
            place: null
            contributors: null
            is_quote_status: boolean
            retweet_count: number
            favorite_count: number
            /* cspell:disable-next-line */
            favorited: boolean
            retweeted: boolean
            lang: 'en'
            supplemental_language: null
            self_thread: {
                id: number
                id_str: string
            }
        }
        contributors_enabled: boolean
        is_translator: boolean
        is_translation_enabled: boolean
        profile_background_color: string
        profile_background_image_url: string
        profile_background_image_url_https: string
        profile_background_tile: boolean
        profile_image_url: string
        profile_image_url_https: string
        profile_banner_url: string
        profile_link_color: string
        profile_sidebar_border_color: string
        profile_sidebar_fill_color: string
        profile_text_color: string
        profile_use_background_image: boolean
        has_extended_profile: boolean
        default_profile: boolean
        default_profile_image: boolean
        has_custom_timelines: boolean
        following: null
        follow_request_sent: null
        notifications: null
        business_profile_state: string
        translator_type: string
        withheld_in_countries: []
        require_some_consent: boolean
    }

    export interface FailedResponse {
        errors: ResponseError[]
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

    export interface Event<T> {
        target: {
            result?: T
        }
    }

    export type UserByScreenNameResponse = Response<{ user: { result: User } }>

    export interface Provider {
        getSettings: () => Promise<Settings | undefined>
        getUserSettings: () => Promise<UserSettings>
        /**
         * @param screenName
         * @param checkNFTAvatar With `checkNFTAvatar` true, will get user via web API directly,
         * because only web API provides has_nft_avatar property
         */
        getUserByScreenName: (screenName: string, checkNFTAvatar?: boolean) => Promise<User | null>
        getUserNftContainer: (screenName: string) => Promise<NFT | undefined>
        uploadUserAvatar: (screenName: string, image: Blob | File) => Promise<TwitterResult>
        updateProfileImage: (screenName: string, media_id_str: string) => Promise<AvatarInfo | undefined>
        staleUserByScreenName: (screenName: string) => Promise<void>
    }
}
