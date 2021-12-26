import { memo } from 'react'
import { Box, Typography, Link, Button, FilledInput } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { EmptyIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { DashboardTrans } from '../../../../locales/i18n_generated'
import { useCopyToClipboard } from 'react-use'
import { useSnackbarCallback } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prompt: {
        color: MaskColorVar.textLight,
        fontSize: theme.typography.pxToRem(12),
        lineHeight: theme.typography.pxToRem(16),
        marginTop: theme.spacing(2.5),
    },
    icon: {
        width: 96,
        height: 96,
        fill: 'none',
    },
    download: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    input: {
        fontSize: 12,
        paddingTop: 8,
        width: 280,
    },
    button: {
        marginLeft: 20,
    },
}))

const downloadUrl = 'https://mask.io/download-links/'

export const EmptyContactPlaceholder = memo(() => {
    const [, copyToClipboard] = useCopyToClipboard()
    const copyDownloadLink = useSnackbarCallback({
        executor: async () => copyToClipboard(downloadUrl),
        deps: [],
    })
    return <EmptyContactPlaceholderUI onCopy={copyDownloadLink} />
})

export interface EmptyContactPlaceholderUIProps {
    onCopy: () => void
}

export const EmptyContactPlaceholderUI = memo<EmptyContactPlaceholderUIProps>(({ onCopy }) => {
    const { classes } = useStyles()
    return (
        <Box className={classes.container}>
            <EmptyIcon className={classes.icon} />
            <Typography className={classes.prompt}>
                <DashboardTrans.personas_empty_contact_tips
                    components={{ i: <Link href={downloadUrl} /> }}
                    values={{ name: 'Mask Network' }}
                />
            </Typography>
            <Box className={classes.download}>
                <FilledInput value={downloadUrl} disabled classes={{ input: classes.input }} />
                <Button className={classes.button} onClick={onCopy}>
                    Copy
                </Button>
            </Box>
        </Box>
    )
})
