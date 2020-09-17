import React, { useState } from 'react'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import type { TypedMessage } from '../../../protocols/typed-message'
import { renderWithPollMetadata } from '../utils'
import Services from '../../../extension/service'
import type { PollGunDB } from '../Services'
import { PollCardUI, PollStatus } from './Polls'
import type { PollMetaData } from '../types'

interface PollsInPostProps {
    message: TypedMessage
}

export default function PollsInPost(props: PollsInPostProps) {
    const { message } = props
    const [status, setStatus] = useState<PollStatus>(PollStatus.Inactive)
    const [updatedPoll, setUpdatedPoll] = useState<PollMetaData | undefined>(undefined)

    const vote = (poll: PollGunDB, index: number) => {
        if (new Date().getTime() <= poll.end_time) {
            setStatus(PollStatus.Voting)
            Services.Plugin.invokePlugin('maskbook.polls', 'vote', {
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

    const jsx = message
        ? renderWithPollMetadata(props.message.meta, (r) => {
              Services.Plugin.invokePlugin('maskbook.polls', 'getPollByKey', { key: r.key as string }).then((res) => {
                  setUpdatedPoll(res as PollMetaData)
              })
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
