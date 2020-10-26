import React from 'react'
import type { TypedMessage } from '../../../protocols/typed-message'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { makeStyles, createStyles } from '@material-ui/core'
import { renderWithRedPacketMetadata } from '../helpers'
import { RedPacketInPost } from './RedPacketInPost'
import { useAccount } from '../../../web3/hooks/useAccount'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            padding: theme.spacing(1, 0),
        },
    }),
)

export interface RedPacketInspectorProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    message: TypedMessage
}

export function RedPacketInspector(props: RedPacketInspectorProps) {
    const { message } = props
    const storybookDebugging: boolean = !!process.env.STORYBOOK
    const account = useAccount()

    const jsx = message
        ? renderWithRedPacketMetadata(message.meta, (r) => {
              if (storybookDebugging) return null
              return (
                  <MaskbookPluginWrapper pluginName="Red Packet">
                      <RedPacketInPost from={account} payload={r} />
                  </MaskbookPluginWrapper>
              )
          })
        : null
    return <>{jsx}</>
}
