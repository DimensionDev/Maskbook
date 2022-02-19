import { first } from 'lodash-unified'
import { setGunData, getGunData } from '@masknet/gun-utils'
import type { PollMetaData } from './types'
import { PollGunRootNode } from './constants'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'
import { AsyncCall } from 'async-call-rpc'

import * as self from './Services'
setTimeout(() => {
    AsyncCall(self, { channel: new WorkerChannel() })
}, 0)

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

    const key = `${id}_${Date.now()}_${GunTextRandom(4)}`

    setGunData([PollGunRootNode, key], poll_item)
    return poll
}

/** Implementation of deprecated Gun.text.random */
function GunTextRandom(l: number) {
    let s = ''
    l = l || 24 // you are not going to make a 0 length random number, so no need to check type
    /* cspell:disable-next-line */
    const c = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz'
    while (l > 0) {
        s += c.charAt(Math.floor(Math.random() * c.length))
        l -= 1
    }
    return s
}

export type PollGunDB = PollMetaData

interface voteProps {
    poll: PollGunDB
    index: number
}

export async function vote(props: voteProps) {
    const { poll, index } = props
    const data = await getGunData(PollGunRootNode, poll.key, 'results')
    if (typeof data === 'object') delete data._
    else throw new TypeError('Invalid vote node.')

    const results = Object.values(data)
    if (!results.every((x): x is number => typeof x === 'number')) throw new TypeError('Invalid vote node.')
    const count = results[index] + 1
    const newResults = {
        ...results,
        [index]: count,
    }

    setGunData([PollGunRootNode, poll.key, 'results'], newResults)

    return {
        ...poll,
        results: Object.values(newResults),
    }
}

export async function getPollByKey(props: { key: string }) {
    const keys = props.key.split('_')

    const node = await getGunData(PollGunRootNode, props.key)
    if (typeof node !== 'object' || !isPollGunDB(node)) throw new TypeError('Invalid vote node.')
    const data = node
    const poll: PollGunDB = {
        ...defaultPoll,
        id: first(keys),
        key: props.key,
        sender: data.sender,
        question: data.question,
        start_time: data.start_time,
        end_time: data.end_time,
    }
    if (data.options) {
        const options = await getGunData(PollGunRootNode, props.key, 'options')
        if (typeof options === 'object') {
            delete options._
            data.options = Object.values(options) as any
        }
    }
    if (data.results) {
        const results = await getGunData(PollGunRootNode, props.key, 'results')
        if (typeof results === 'object') {
            delete results._
            data.results = Object.values(results) as any
        }
    }
    return poll
}

function isPollGunDB(x: object): x is PollGunDB {
    const { end_time } = x as PollGunDB
    if (typeof end_time !== 'number') return false
    return true
}

export async function getAllExistingPolls() {
    const polls: PollGunDB[] = []

    const allNodes = await getGunData(PollGunRootNode)
    if (typeof allNodes !== 'object') return []
    await Promise.allSettled(
        Object.keys(allNodes).map(async (key) => {
            polls.push(await getPollByKey({ key }))
        }),
    )
    return polls
}
