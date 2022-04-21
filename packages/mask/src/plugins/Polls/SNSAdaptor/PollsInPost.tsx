import { useEffect, useState } from 'react'
import type { TypedMessage } from '@masknet/typed-message'
import { PluginPollRPC } from '../messages'
import { renderWithPollMetadata, PollMetadataReader } from '../helpers'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import { PollMetaData, PollStatus } from '../types'
import { usePluginWrapper } from '@masknet/plugin-infra/dom'

interface PollsInPostProps {
    message: TypedMessage
}

export default function PollsInPost(props: PollsInPostProps) {
    const [status, setStatus] = useState<PollStatus>(PollStatus.Inactive)
    const [updatedPoll, setUpdatedPoll] = useState<PollMetaData | undefined>(undefined)

    const vote = (poll: PollGunDB, index: number) => {
        if (Date.now() <= poll.end_time) {
            setStatus(PollStatus.Voting)
            PluginPollRPC.vote({
                poll,
                index,
            }).then((res) => {
                setStatus(PollStatus.Voted)
                setUpdatedPoll(res as PollMetaData)
            })
        } else {
            setStatus(PollStatus.Closed)
        }
    }

    useEffect(() => {
        const metadata = PollMetadataReader(props.message.meta)
        if (metadata.ok) {
            const key = metadata.val.key
            PluginPollRPC.getPollByKey({ key }).then((res) => {
                setUpdatedPoll(res as PollMetaData)
            })
        }
    }, [props.message.meta])

    return renderWithPollMetadata(props.message.meta, (r) => {
        return <C poll={updatedPoll ?? r} vote={vote} status={status} />
    })
}
const C: typeof PollCardUI = (props) => {
    usePluginWrapper(true, { width: 400 })
    return (
        <div>
            <PollCardUI {...props} />
        </div>
    )
}
