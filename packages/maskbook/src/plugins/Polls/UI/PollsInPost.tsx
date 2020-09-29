import React, { useEffect, useState } from 'react'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import type { TypedMessage } from '../../../protocols/typed-message'
import { renderWithPollMetadata, PollMetadataReader } from '../utils'
import Services from '../../../extension/service'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import { PollMetaData, PollStatus } from '../types'

interface PollsInPostProps {
    message: TypedMessage
}

export default function PollsInPost(props: PollsInPostProps) {
    const { message } = props
    const [status, setStatus] = useState<PollStatus>(PollStatus.Inactive)
    const [updatedPoll, setUpdatedPoll] = useState<PollMetaData | undefined>(undefined)

    const voter_name = useCurrentIdentity()?.linkedPersona?.nickname
    const voter_id = useCurrentIdentity()?.linkedPersona?.fingerprint

    const vote = (poll: PollGunDB, index: number) => {
        if (new Date().getTime() <= poll.end_time) {
            setStatus(PollStatus.Voting)
            Services.Plugin.invokePlugin('maskbook.polls', 'vote', {
                poll,
                option_index: index,
                voter_name,
                voter_id,
                voting_time: new Date(),
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
            Services.Plugin.invokePlugin('maskbook.polls', 'getPollByKey', { key }).then((res) => {
                setUpdatedPoll(res as PollMetaData)
            })
        }
    }, [props.message.meta])

    const jsx = message
        ? renderWithPollMetadata(props.message.meta, (r) => {
              return (
                  <div>
                      <MaskbookPluginWrapper width={400} pluginName="Poll">
                          <PollCardUI poll={updatedPoll ?? r} vote={vote} status={status} />
                      </MaskbookPluginWrapper>
                  </div>
              )
          })
        : null
    return <>{jsx}</>
}
