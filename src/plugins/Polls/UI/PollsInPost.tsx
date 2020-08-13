import React, { useState } from 'react'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { withMetadata, TypedMessage } from '../../../extension/background-script/CryptoServices/utils'
import Services from '../../../extension/service'
import { getActivatedUI } from '../../../social-network/ui'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'

interface PollsInPostProps {
    message: TypedMessage
}

export default function PollsInPost(props: PollsInPostProps) {
    const { message } = props
    const [open, setOpen] = useState(false)

    const vote = (poll: PollGunDB, index: number) => {
        setOpen(true)
        if (new Date().getTime() <= poll.end_time) {
            Services.Plugin.invokePlugin('maskbook.polls', 'vote', {
                poll,
                index,
            }).then((res) => {
                const ref = getActivatedUI().typedMessageMetadata
                const next = new Map(ref.value.entries())
                res ? next.set('poll', res) : next.delete('poll')
                ref.value = next
            })
        }
    }

    const jsx = message
        ? withMetadata(props.message.meta, 'poll', (r) => (
              <div>
                  <MaskbookPluginWrapper width={400} pluginName="Poll">
                      <PollCardUI poll={r} vote={vote} />
                  </MaskbookPluginWrapper>
                  <PostDialog open={[open, setOpen]} />
              </div>
          ))
        : null
    return <>{jsx}</>
}
