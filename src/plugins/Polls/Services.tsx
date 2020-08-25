import Gun from 'gun'
import 'gun/lib/then.js'
import { Result, Err, Ok } from 'ts-results'
import { gunServers } from '../../network/gun-servers'
import type { PollMetaData } from './types'
import { PluginMessageCenter } from '../PluginMessages'

const gun = new Gun(gunServers)

interface NewPollProps {
    sender?: string | undefined
    id?: string | undefined
    question: string
    options: Object
    start_time: Date
    end_time: Date
}

enum Reason {
    NoPermission,
    InvalidURL,
    FetchFailed,
}

export async function createNewPoll(poll: NewPollProps): Promise<Result<NewPollProps, [Reason, Error?]>> {
    const { id, sender, question, options, start_time, end_time } = poll

    let results = {}
    for (let i = 0; i < Object.values(options).length; i = i + 1) {
        results = {
            ...results,
            [i]: 0,
        }
    }

    const poll_item = {
        id,
        sender,
        question,
        start_time: start_time.getTime(),
        end_time: end_time.getTime(),
        options,
        results,
    }

    // @ts-ignore
    const key = `${id}_${Gun.time.is()}_${Gun.text.random(4)}`

    await gun
        .get('polls')
        .get(key)
        // @ts-ignore
        .put(poll_item).then!()

    return new Ok({
        sender,
        question,
        options,
        start_time,
        end_time,
    })
}

export type PollGunDB = PollMetaData

export async function getExistingPolls() {
    const polls: Array<PollGunDB> = []

    gun.get('polls')
        .map()
        .on((data: any, key) => {
            const keys = (key as string).split('_')
            const poll: PollGunDB = {
                key: key,
                id: keys[0],
                sender: data.sender,
                question: data.question,
                start_time: data.start_time,
                end_time: data.end_time,
                options: ['', ''],
                results: [0, 0],
            }
            if (data.options) {
                gun.get('polls')
                    .get(key)
                    .get('options')
                    .on((options) => {
                        delete options._
                        poll.options = Object.values(options)
                    })
            }
            if (data.results) {
                gun.get('polls')
                    .get(key)
                    .get('results')
                    .on((results) => {
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
        .get(poll.key)
        .get('results')
        .on((item) => {
            delete item._
            results = Object.values(item)
        })
    const count = results[index] + 1
    const newResults = {
        ...results,
        [index]: count,
    }

    gun.get('polls')
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

export async function getPollByKey(props: { key: string | number | symbol }) {
    const keys = (props.key as string).split('_')
    let poll: PollGunDB = {
        key: props.key,
        id: keys[0],
        sender: '',
        question: '',
        start_time: 0,
        end_time: 0,
        options: ['', ''],
        results: [0, 0],
    }
    gun.get('polls')
        .get(props.key)
        .on((data) => {
            poll = {
                key: props.key,
                id: keys[0],
                sender: data.sender,
                question: data.question,
                start_time: data.start_time,
                end_time: data.end_time,
                options: ['', ''],
                results: [0, 0],
            }
            if (data.options) {
                gun.get('polls')
                    .get(props.key)
                    .get('options')
                    .on((options) => {
                        delete options._
                        poll.options = Object.values(options)
                    })
            }
            if (data.results) {
                gun.get('polls')
                    .get(props.key)
                    .get('results')
                    .on((results) => {
                        delete results._
                        poll.results = Object.values(results)
                    })
            }
        })
    return poll
}
