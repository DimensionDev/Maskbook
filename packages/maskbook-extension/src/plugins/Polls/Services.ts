import Gun from 'gun'
import 'gun/lib/then.js'
import { first } from 'lodash-es'
import { gun2 } from '../../network/gun/version.2'
import type { PollMetaData } from './types'
import { PollGunServer } from './constants'
import { PluginMessageCenter } from '../PluginMessages'

const gun = gun2
const PollGun = gun.get(PollGunServer)

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
    const key = `${id}_${Gun.time.is()}_${Gun.text.random(4)}`

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
    index: number
}

export async function vote(props: voteProps) {
    const { poll, index } = props
    let results = [0, 0]
    PollGun
        // @ts-ignore
        .get(poll.key)
        .get('results')
        .on((item) => {
            // @ts-ignore
            delete item._
            results = Object.values(item)
        })
    const count = results[index] + 1
    const newResults = {
        ...results,
        [index]: count,
    }

    PollGun
        // @ts-ignore
        .get(poll.key)
        .get('results')
        // @ts-ignore
        .put(newResults)

    PluginMessageCenter.emit('maskbook.polls.update', undefined)

    return {
        ...poll,
        results: Object.values(newResults),
    }
}

export async function getPollByKey(props: { key: string }) {
    const keys = props.key.split('_')
    let poll: PollGunDB = {
        ...defaultPoll,
        key: props.key,
        id: first(keys),
    }

    PollGun
        // @ts-ignore
        .get(props.key)
        .on((data: PollGunDB) => {
            poll = {
                ...poll,
                sender: data.sender,
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
    return poll
}

export async function getAllExistingPolls() {
    const polls: PollGunDB[] = []

    PollGun.map().on(async (data, key) => {
        const poll = await getPollByKey({ key })
        polls.push(poll)
    })

    return polls
}
