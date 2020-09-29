export interface PollMetaData {
    question: string
    key: string
    start_time: number
    end_time: number
    options: string[]
    results: number[]
    sender_name?: string
    sender_id?: string
    voting_history?: VotingDetail[]
}

export interface VotingDetail {
    voter_id: string
    voter_name: string
    option_index: number
    voting_time: number
}

export enum PollStatus {
    Inactive = 'Inactive',
    Voted = 'Voted',
    Voting = 'Voting',
    Closed = 'Closed',
}
