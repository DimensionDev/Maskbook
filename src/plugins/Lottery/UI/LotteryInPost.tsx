import React from 'react'
import type { TypedMessage } from '../../../protocols/typed-message'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { LotteryCard } from './Lottery'
import { makeStyles, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { getPostUrl } from '../../../social-network/utils/getPostUrl'
import { renderWithLotteryMetadata } from '../utils'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            padding: theme.spacing(1, 0),
        },
    }),
)

interface LotteryInDecryptedPostProps
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

export default function LotteryInDecryptedPost(props: LotteryInDecryptedPostProps) {
    const { t } = useI18N()
    const { message } = props
    const postIdentifier = usePostInfoDetails('postIdentifier')
    const storybookDebugging: boolean = !!process.env.STORYBOOK
    const jsx = message
        ? renderWithLotteryMetadata(message.meta, (r) => (
              <MaskbookPluginWrapper pluginName="Lottery">
                  <LotteryCard
                      from={postIdentifier && !postIdentifier.isUnknown ? getPostUrl(postIdentifier) : undefined}
                      payload={storybookDebugging ? undefined : r}
                  />
              </MaskbookPluginWrapper>
          ))
        : null
    return <>{jsx}</>
}
