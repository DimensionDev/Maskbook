export namespace TwitterBaseAPI {
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
    type UserUrl = {
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
        legacy: {
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
    export type Response<T> = {
        data: T
    }
    export type UserByScreenNameResponse = Response<{ user: { result: User } }>
    export interface AvatarInfo {
        nickname: string
        userId: string
        imageUrl: string
        mediaId: string
    }

    export interface Settings {
        screen_name: string
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

    export interface Provider {
        getSettings: () => Promise<Settings | undefined>
        getUserNftContainer: (screenName: string) => Promise<
            | {
                  address: string
                  token_id: string
                  type_name: string
              }
            | undefined
        >
        uploadUserAvatar: (screenName: string, image: Blob | File) => Promise<TwitterResult>
        updateProfileImage: (screenName: string, media_id_str: string) => Promise<AvatarInfo | undefined>
        getUserByScreenName: (screenName: string) => Promise<User | null>
    }
}
