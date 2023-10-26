import { makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { memo } from 'react'
import { useNextID_Trans } from '../locales/i18n_generated.js'
import { EmojiAvatar } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
    },
    text: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1.5),
        marginRight: theme.spacing(1.5),
        fontSize: 14,
        wordBreak: 'break-all',
    },
    button: {
        width: 42,
    },
}))

interface Props {
    payload: string
}
export const VerificationPayload = memo(function VerificationPayload({ payload }: Props) {
    const { classes } = useStyles()
    const t = useNextID_Trans()
    return (
        <div className={classes.container}>
            <EmojiAvatar value={payload} sx={{ height: 40, width: 40 }} />
            <Typography className={classes.text}>{payload}</Typography>
            <Button className={classes.button} variant="roundedContained">
                {t.view()}
            </Button>
        </div>
    )
})
