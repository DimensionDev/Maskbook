import type { TypedMessage } from '../../../protocols/typed-message'
import { makeStyles, createStyles } from '@material-ui/core'
import { renderWithRedPacketMetadata } from '../helpers'
import { RedPacketInPost } from './RedPacketInPost'
import { ChainState } from '../../../web3/state/useChainState'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            padding: theme.spacing(1, 0),
        },
    }),
)

export interface RedPacketInspectorProps extends withClasses<never> {
    message: TypedMessage
}

export function RedPacketInspector(props: RedPacketInspectorProps) {
    const { message } = props

    const jsx = message
        ? renderWithRedPacketMetadata(message.meta, (r) => {
              if (process.env.STORYBOOK) return null
              return (
                  <ChainState.Provider>
                      <RedPacketInPost payload={r} />
                  </ChainState.Provider>
              )
          })
        : null
    return <>{jsx}</>
}
