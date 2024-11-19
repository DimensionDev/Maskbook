// cspell:ignore wabrf0h5, cout, submited
export interface LumaEvent {
    api_id: string
    calendar_api_id: string
    cover_url: string
    /** @example '2024-11-22T09:00:00.000Z' */
    end_at: string
    event_type: LiteralUnion<'independent'>
    hide_rsvp: boolean
    location_type: LiteralUnion<'offline'>
    name: string
    one_to_one: boolean
    recurrence_id: null | string
    show_guest_list: boolean
    /** @example '2024-11-22T06:30:00.000Z' */
    start_at: string
    timezone: string
    /**
     * url slug.
     * @example wabrf0h5
     *
     * then full url will be `https://lu.ma/wabrf0h5`
     * Will prepend `https://lu.ma/` after fetching data
     */
    url: string
    user_api_id: string
    visibility: LiteralUnion<'public'>
    waitlist_enabled: boolean
    can_register_for_multiple_tickets: boolean
    duration_interval: `P${number}Y${number}M${number}DT${number}H${number}M${number}S`
    virtual_info: {
        has_access: boolean
    }
    geo_longitude: string
    geo_latitude: string
    geo_address_info: {
        mode: string
        city_state: string
    }
    geo_address_visibility: LiteralUnion<'guests-only'>
}

interface CoverImage {
    vibrant_color: null
    colors: string[]
}

interface Calendar {
    access_level: string
    api_id: string
    avatar_url: string
    cover_image_url: string
    description_short: string | null
    event_submission_restriction: string
    geo_city: string | null
    geo_country: string | null
    geo_latitude: number | null
    geo_longitude: number | null
    geo_region: string | null
    google_measurement_id: string | null
    instagram_handle: string | null
    launch_status: string
    linkedin_handle: string | null
    luma_plus_active: boolean
    meta_pixel_id: string | null
    name: string
    personal_user_api_id: string
    refund_policy: string | null
    slug: string | null
    social_image_url: string | null
    stripe_account_id: string
    tax_config: string | null
    tiktok_handle: string | null
    timezone: string | null
    tint_color: string
    track_meta_ads_from_luma: boolean
    twitter_handle: string | null
    verified_at: string | null
    website: string | null
    youtube_handle: string | null
    is_personal: boolean
}
interface Host {
    api_id: string
    avatar_url: string
    bio_short: string
    instagram_handle: string
    last_online_at: string
    linkedin_handle: string
    name: string
    tiktok_handle: string | null
    timezone: string
    twitter_handle: string | null
    username: string
    website: string
    youtube_handle: string
    access_level: string
    event_api_id: string
}

export interface TicketInfo {
    price: {
        cents: number
        currency: LiteralUnion<'hkd' | 'usd'>
        is_flexible: boolean
    }
    is_free: boolean
    max_price: null
    is_sold_out: boolean
    spots_remaining: null
    is_near_capacity: boolean
    require_approval: boolean
    currency_info: {
        currency: LiteralUnion<'hkd' | 'usd'>
    }
}

export interface FeatureGuest {
    api_id: string
    avatar_url: string
    bio_short: string
    /** @example '2024-11-22T09:00:00.000Z' */
    last_online_at: string
    /** @example '/in/Vyu' */
    linkedin_handle: string
    name: string
    tiktok_handle: string | null
    timezone: string
    twitter_handle: string
    username: string | null
    website: string | null
    youtube_handle: string | null
    instagram_handle: string | null
}

export interface LumaEntry {
    api_id: string
    /** @example '2024-11-22T09:00:00.000Z' */
    start_at: string
    event: LumaEvent
    cover_image: CoverImage
    calendar: Calendar
    hosts: Host[]
    guest_cout: number
    ticket_count: number
    ticket_info: TicketInfo
    feature_guests: FeatureGuest[]
    role: string | null
    submited_by_user_api_id: string
    is_manually_featured: boolean
}

export interface GetEventResponse {
    entries: LumaEntry[]
    has_more: boolean
    next_cursor?: string
}
