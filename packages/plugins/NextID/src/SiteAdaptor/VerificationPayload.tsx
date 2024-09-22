import { EmojiAvatar } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { memo } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
    },
    text: {
        flexGrow: 1,
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
    pubkey: string
}
export const VerificationPayload = memo(function VerificationPayload({ pubkey }: Props) {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <EmojiAvatar value={pubkey} size={40} />
            <Typography className={classes.text}>{pubkey}</Typography>
            <Button
                className={classes.button}
                variant="roundedContained"
                href={`https://web3.bio/?s=${pubkey}`}
                target="_blank"
                rel="noopener noreferrer">
                <Trans>View</Trans>
            </Button>
        </div>
    )
})
