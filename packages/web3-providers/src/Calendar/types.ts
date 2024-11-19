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

interface Response<T> {
    code: number
    data?: {
        events: T[]
        page: {
            cursor: string
            next: string
        }
    }
    message: string
    reason?: string
}

export type EventResponse = Response<Event>
