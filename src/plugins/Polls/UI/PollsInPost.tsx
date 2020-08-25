import React, { useState } from 'react'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { withMetadata, TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import Services from '../../../extension/service'
import type { PollGunDB } from '../Services'
import { PollCardUI, PollStatus } from './Polls'
import type { PollMetaData } from '../types'

interface PollsInPostProps {
    message: TypedMessage
}

export default function PollsInPost(props: PollsInPostProps) {
    const { message } = props
    const [status, setStatus] = useState<PollStatus>('Inactive')
    const [updatedPoll, setUpdatedPoll] = useState<PollMetaData | undefined>(undefined)

    const vote = (poll: PollGunDB, index: number) => {
        if (new Date().getTime() <= poll.end_time) {
            setStatus('Voting')
            Services.Plugin.invokePlugin('maskbook.polls', 'vote', {
                poll,
                index,
            }).then((res) => {
                setStatus('Voted')
                setUpdatedPoll(res as PollMetaData)
            })
        } else {
            setStatus('Closed')
        }
    }

    const jsx = message
        ? withMetadata(props.message.meta, 'poll', (r) => {
              Services.Plugin.invokePlugin('maskbook.polls', 'getPollByKey', { key: r.key }).then((res) => {
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
