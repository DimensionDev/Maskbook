import { first } from 'lodash-unified'
import '../../network/gun/gun-worker.patch'
import { gun2 } from '../../network/gun/version.2'
import type { PollMetaData } from './types'
import { PollGunServer } from './constants'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { AsyncCall } from 'async-call-rpc'

import * as self from './Services'
setTimeout(() => {
    AsyncCall(self, { channel: new WorkerChannel() })
}, 0)

const PollGun = gun2.get(PollGunServer)

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
        // @ts-ignore
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
        // @ts-ignore
        .get('results')
        // @ts-ignore
        .put(newResults)

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
        // @ts-ignore
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
                    // @ts-ignore
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
                    // @ts-ignore
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
