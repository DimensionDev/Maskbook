export interface ProjectInfo {
    links: Array<{
        type: string
        url: string
    }>
    logo: string
    name: string
    description: string
}
export interface ExtensionInfo {
    nft_info: {
        token: string
        total: string
    }
    poster_url: string
}

/** Calendar Event */
export interface Event {
    event_content: string
    event_date: string
    event_description: string
    event_id: string
    event_source: string
    event_title: string
    event_type: string
    event_url: string
    poster_url: string
    project?: ProjectInfo
    ext_info?: ExtensionInfo
    /** data from provider */
    raw_data: unknown
}

/** API returns in seconds, string type, will convert into number */
export type ParsedEvent = Omit<Event, 'event_date'> & {
    event_date: number
    event_city?: string
    event_country?: string
    event_full_location?: string
    host_name?: string
    /** avatar url */
    host_avatar?: string
}

export enum EventProvider {
    CoinCarp = 'coincarp',
    Luma = 'luma',
}

interface Response<T> {
    code: number
    data: T
    message: string
    reason?: string
}

export type EventResponse = Response<{
    events: Event[]
    page: {
        cursor: string
        next: string
    }
}>

export type EventDatesResponse = Response<number[]>
