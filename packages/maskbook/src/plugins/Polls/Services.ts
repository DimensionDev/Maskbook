import Gun from 'gun'
import 'gun/lib/then.js'
import { first } from 'lodash-es'
import { gun2 } from '../../network/gun/version.2'
import type { PollMetaData, VotingDetail } from './types'
import { PollGunServer } from './constants'
import { PluginMessageCenter } from '../PluginMessages'

const gun = gun2
const PollGun = gun.get(PollGunServer)

const defaultPoll: PollGunDB = {
    key: '',
    sender_name: '',
    question: '',
    start_time: Date.now(),
    end_time: Date.now(),
    options: ['', ''],
    results: [0, 0],
}

interface NewPollProps {
    sender_name?: string | undefined
    sender_id?: string | undefined
    question: string
    options: string[]
    start_time: Date
    end_time: Date
}

export async function createNewPoll(poll: NewPollProps) {
    const { sender_id, options, start_time, end_time } = poll

    const results = new Array<number>(options.length).fill(0)
    const resultsObj = { ...results }
    const optionsObj = { ...options }

    const poll_item = {
        ...poll,
        results: resultsObj,
        options: optionsObj,
        start_time: start_time.getTime(),
        end_time: end_time.getTime(),
    }

    // @ts-ignore
    const key = `${sender_id}_${Gun.time.is()}_${Gun.text.random(4)}`

    await PollGun
        // @ts-ignore
        .get(key)
        // @ts-ignore
        .put(poll_item).then!()

    return poll
}

export type PollGunDB = PollMetaData

interface voteProps {
    poll: PollGunDB
    option_index: number
    voter_id?: string
    voter_name?: string
    voting_time?: Date
}

export async function getVotingHistory(props: { key: string }) {
    const PollHistoryGun = PollGun
        // @ts-ignore
        .get(props.key)
        .get('history')
    const history: VotingDetail[] = []
    PollHistoryGun.map().on((item) => {
        // @ts-ignore
        delete item._
        const detail = item
        history.push(detail)
    })
    return history
}

export async function updateVotingHistory(props: voteProps) {
    const { poll, option_index, voter_id, voter_name, voting_time } = props
    // @ts-ignore
    const voting_key = `${voter_id}_${Gun.time.is()}_${Gun.text.random(4)}`
    const vote_detail = {
        option_index,
        voter_id,
        voter_name,
        voting_time: voting_time?.getTime(),
    }

    PollGun
        // @ts-ignore
        .get(poll.key)
        .get('history')
        .get(voting_key)
        // @ts-ignore
        .put(vote_detail)
}

export async function updateVotingResults(props: voteProps) {
    const { poll, option_index } = props
    const PollResultsGun = PollGun
        // @ts-ignore
        .get(poll.key)
        .get('results')

    let results = [0, 0]
    PollResultsGun.on((item) => {
        // @ts-ignore
        delete item._
        results = Object.values(item)
    })

    const count = results[option_index] + 1
    const newResults = {
        ...results,
        [option_index]: count,
    }
    PollResultsGun
        // @ts-ignore
        .put(newResults)

    return newResults
}

export async function vote(props: voteProps) {
    const { poll } = props

    const newResults = await updateVotingResults(props)
    await updateVotingHistory(props)
    const history = await getVotingHistory({ key: poll.key })

    PluginMessageCenter.emit('maskbook.polls.update', undefined)

    return {
        ...poll,
        voting_history: history,
        results: Object.values(newResults),
    }
}

export async function getPollByKey(props: { key: string }) {
    const keys = props.key.split('_')
    let poll: PollGunDB = {
        ...defaultPoll,
        key: props.key,
        sender_id: first(keys),
    }

    PollGun
        // @ts-ignore
        .get(props.key)
        .on((data: PollGunDB) => {
            poll = {
                ...poll,
                sender_name: data.sender_name,
                question: data.question,
                start_time: data.start_time,
                end_time: data.end_time,
            }
            if (data.options) {
                PollGun
                    // @ts-ignore
                    .get(props.key)
                    .get('options')
                    .on((options) => {
                        // @ts-ignore
                        delete options._
                        poll.options = Object.values(options)
                    })
            }
            if (data.results) {
                PollGun
                    // @ts-ignore
                    .get(props.key)
                    .get('results')
                    .on((results) => {
                        // @ts-ignore
                        delete results._
                        poll.results = Object.values(results)
                    })
            }
        })

    const history = await getVotingHistory({ key: poll.key })

    return {
        ...poll,
        voting_history: history,
    }
}

export async function getAllExistingPolls() {
    const polls: PollGunDB[] = []

    PollGun.map().on(async (data, key) => {
        const poll = await getPollByKey({ key })
        polls.push(poll)
    })

    return polls
}
