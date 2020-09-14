import Gun from 'gun'
import 'gun/lib/then.js'
import type { PollMetaData } from './types'
import { PluginMessageCenter } from '../PluginMessages'
import { gun2 } from '../../network/gun/version.2'
import { first } from 'lodash-es'

const gun = gun2

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
    options: Array<string>
    start_time: Date
    end_time: Date
}

export async function createNewPoll(poll: NewPollProps) {
    const { id, options, start_time, end_time } = poll

    const results = new Array<number>(options.length).fill(0)
    const resultsObj: Object = { ...results }
    const optionsObj: Object = { ...options }

    const poll_item = {
        ...poll,
        results: resultsObj,
        options: optionsObj,
        start_time: start_time.getTime(),
        end_time: end_time.getTime(),
    }

    // @ts-ignore
    const key = `${id}_${Gun.time.is()}_${Gun.text.random(4)}`

    await gun
        .get('polls')
        // @ts-ignore
        .get(key)
        // @ts-ignore
        .put(poll_item).then!()

    return poll
}

export type PollGunDB = PollMetaData

export async function getExistingPolls() {
    const polls: Array<PollGunDB> = []

    gun.get('polls')
        .map()
        .on((data: any, key) => {
            const keys = typeof key === 'string' ? key.split('_') : undefined
            const poll: PollGunDB = {
                ...defaultPoll,
                key: key,
                id: first(keys),
                sender: data.sender,
                question: data.question,
                start_time: data.start_time,
                end_time: data.end_time,
            }
            if (data.options) {
                gun.get('polls')
                    // @ts-ignore
                    .get(key)
                    .get('options')
                    .on((options) => {
                        // @ts-ignore
                        delete options._
                        poll.options = Object.values(options)
                    })
            }
            if (data.results) {
                gun.get('polls')
                    // @ts-ignore
                    .get(key)
                    .get('results')
                    .on((results) => {
                        // @ts-ignore
                        delete results._
                        poll.results = Object.values(results)
                    })
            }
            polls.push(poll)
        })

    return polls
}

interface voteProps {
    poll: PollGunDB
    index: number
}

export async function vote(props: voteProps) {
    const { poll, index } = props
    let results: Array<number> = [0, 0]
    gun.get('polls')
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

    gun.get('polls')
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
    gun.get('polls')
        // @ts-ignore
        .get(props.key)
        .on((data) => {
            poll = {
                ...poll,
                // @ts-ignore
                sender: data.sender,
                // @ts-ignore
                question: data.question,
                // @ts-ignore
                start_time: data.start_time,
                // @ts-ignore
                end_time: data.end_time,
            }
            // @ts-ignore
            if (data.options) {
                gun.get('polls')
                    // @ts-ignore
                    .get(props.key)
                    .get('options')
                    .on((options) => {
                        // @ts-ignore
                        delete options._
                        poll.options = Object.values(options)
                    })
            }
            // @ts-ignore
            if (data.results) {
                gun.get('polls')
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
