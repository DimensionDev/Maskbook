import { first } from 'lodash-unified'
import type { PollMetaData } from './types'

const defaultPoll: PollGunDB = {
    key: '',
    sender: '',
    question: '',
    start_time: Date.now(),
    end_time: Date.now(),
    options: ['', ''],
    results: [0, 0],
}

interface NewPollProps {
    sender?: string | undefined
    id?: string | undefined
    question: string
    options: string[]
    start_time: Date
    end_time: Date
}

export async function createNewPoll(poll: NewPollProps) {
    const { id, options, start_time, end_time } = poll

    const results = Array.from<number>({ length: options.length }).fill(0)
    const resultsObj = { ...results }
    const optionsObj = { ...options }

    // TODO:

    return poll
}

export type PollGunDB = PollMetaData

interface voteProps {
    poll: PollGunDB
    index: number
}

export async function vote(props: voteProps) {
    const { poll, index } = props
    const results = [0, 0]

    // TODO:
    const count = results[index] + 1
    const newResults = {
        ...results,
        [index]: count,
    }

    return {
        ...poll,
        results: Object.values(newResults),
    }
}

export async function getPollByKey(props: { key: string }) {
    const keys = props.key.split('_')
    const poll: PollGunDB = {
        ...defaultPoll,
        key: props.key,
        id: first(keys),
    }

    // TODO:
    return poll
}

export async function getAllExistingPolls() {
    const polls: PollGunDB[] = []

    // TODO:
    return polls
}
