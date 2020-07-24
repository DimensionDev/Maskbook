import Gun from 'gun'
import 'gun/lib/then.js'
import { gunServers } from '../../network/gun-servers'
import { Result, Err, Ok } from 'ts-results'

const gun = new Gun('https://safe-citadel-45310.herokuapp.com/gun')
// @ts-ignore
window.gun = gun

interface NewPollProps {
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
    const { question, options, start_time, end_time } = poll

    console.log('polls')

    let results = {}
    for (let i = 0; i < Object.values(options).length; i++) {
        results = {
            ...results,
            [i]: 0,
        }
    }

    const poll_item = {
        question,
        start_time: start_time.getTime(),
        end_time: end_time.getTime(),
        options,
        results,
    }

    // @ts-ignore
    const key = `${Gun.time.is()}_${Gun.text.random(4)}`

    await gun
        .get('polls')
        .get(key)
        // @ts-ignore
        .put(poll_item).then!()

    return new Ok({
        question,
        options,
        start_time,
        end_time,
    })
}

export interface PollGunDB {
    key: string | number | symbol
    question: string
    start_time: number
    end_time: number
    options: Array<string>
    results: Array<number>
}

export async function getExistingPolls() {
    let polls: Array<PollGunDB> = []

    gun.get('polls')
        .map()
        .on((data: any, key) => {
            let poll: PollGunDB = {
                key: key,
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
