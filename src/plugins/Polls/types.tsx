export interface PollMetaData {
    question: string
    key: string | number | symbol
    start_time: number
    end_time: number
    options: Array<string>
    results: Array<number>
    sender?: string
    id?: string
}
