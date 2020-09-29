import React from 'react'
import type { TypedMessage } from '../../../protocols/typed-message'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { RedPacketInPost } from './RedPacket'
import { makeStyles, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { getPostUrl } from '../../../social-network/utils/getPostUrl'
import { renderWithRedPacketMetadata } from '../utils'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            padding: theme.spacing(1, 0),
        },
    }),
)

interface RedPacketInDecryptedPostProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'actions'
        | 'close'
        | 'button'
        | 'label'
        | 'title'
    > {
    message: TypedMessage
}

export default function RedPacketInDecryptedPost(props: RedPacketInDecryptedPostProps) {
    const { t } = useI18N()
    const { message } = props
    const postIdentifier = usePostInfoDetails('postIdentifier')
    const storybookDebugging: boolean = !!process.env.STORYBOOK
    /* without redpacket */
    const jsx = message
        ? renderWithRedPacketMetadata(message.meta, (r) => (
              <MaskbookPluginWrapper pluginName="Red Packet">
                  <RedPacketInPost
                      from={postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined}
                      payload={storybookDebugging ? undefined : r}
                  />
              </MaskbookPluginWrapper>
          ))
        : null
    return <>{jsx}</>
}
