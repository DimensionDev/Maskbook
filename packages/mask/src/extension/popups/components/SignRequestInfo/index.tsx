import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
    },
    source: {
        padding: theme.spacing(1.25),
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.25),
        borderRadius: 8,
    },
    sourceText: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    messageTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: theme.spacing(3),
    },
    message: {
        fontSize: 12,
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        wordBreak: 'break-all',
        maxHeight: 260,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface SignRequestInfoProps {
    message: string
    source?: string | null
}

export const SignRequestInfo = memo<SignRequestInfoProps>(function SignRequestInfo({ message, source }) {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <main className={classes.container}>
            <Typography className={classes.title}>{t('popups_wallet_signature_request_title')}</Typography>
            {source ? (
                <Box className={classes.source}>
                    <Typography fontSize={16} fontWeight={700}>
                        {t('popups_wallet_request_source')}
                    </Typography>
                    <Typography className={classes.sourceText}>{source}</Typography>
                </Box>
            ) : null}
            <Typography className={classes.messageTitle}>{t('popups_wallet_sign_message')}</Typography>
            <Typography className={classes.message}>{message}</Typography>
        </main>
    )
})
