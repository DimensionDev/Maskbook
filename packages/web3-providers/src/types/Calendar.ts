export namespace CalendarBaseAPI {
    export interface Provider {
        getNewsList(date: number): Promise<any>
        getEventList(date: number): Promise<any>
        getNFTList(date: number): Promise<any>
    }
}
