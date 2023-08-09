import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Report as ReportIcon, HourglassBottom as HourglassBottomIcon } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { PluginScamRPC } from '../messages.js'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { useState } from 'react'
import { delay } from '@masknet/kit'

const useStyles = makeStyles()((theme) => ({
    button: {
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        color: 'rgb(136, 153, 166)',
    },
    icon: {
        color: 'rgb(113, 118, 123)',
    },
    tooltip: {
        backgroundColor: 'rgb(102,102,102)',
        color: 'white',
        marginTop: '0 !important',
    },
}))

function ReportButton() {
    const { classes } = useStyles()
    const [isSending, setSending] = useState(false)
    const links = usePostInfoDetails.mentionedLinks()
    const author = usePostInfoDetails.author()
    const id = usePostInfoDetails.identifier()
    const nickname = usePostInfoDetails.nickname()
    const message = extractTextFromTypedMessage(usePostInfoDetails.rawMessage())
    const postDetail = {
        id: id ? id.postID : undefined,
        nickname,
        userId: author?.userId,
        links: [...links],
        content: message.some ? message.val : null,
    }
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setSending(true)
        await PluginScamRPC.sendReportScam({
            slug: 'report_button',
            name: 'report_button',
            matchType: 'report_button',
            externalUrl: null,
            twitterUsername: null,
            post: postDetail,
        })
        await delay(1200)
        setSending(false)
    }
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            title={isSending ? 'Reporting' : 'Report scam'}
            placement="bottom"
            arrow={false}>
            <div className={classes.button}>
                <IconButton aria-label="delete" size="small" onClick={(evt) => handleClick(evt)}>
                    {isSending ? (
                        <HourglassBottomIcon className={classes.icon} />
                    ) : (
                        <ReportIcon className={classes.icon} />
                    )}
                </IconButton>
            </div>
        </ShadowRootTooltip>
    )
}

export default ReportButton
