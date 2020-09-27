export interface PollMetaData {
    question: string
    key: string
    start_time: number
    end_time: number
    options: string[]
    results: number[]
    sender?: string
    id?: string
}

export enum PollStatus {
    Inactive = 'Inactive',
    Voted = 'Voted',
    Voting = 'Voting',
    Closed = 'Closed',
}
