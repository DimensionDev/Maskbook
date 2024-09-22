import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        color: theme.palette.text.primary,
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.main,
    },
    setIcon: {
        width: 14,
        height: 14,
        marginLeft: 2,
    },
    icon: {
        color: theme.palette.text.buttonText,
    },
    text: {
        color: theme.palette.text.buttonText,
    },
}))

export interface NFTAvatarButtonProps extends withClasses<'root' | 'text'> {
    onClick: () => void
    showSettings?: boolean
}

export function NFTAvatarButton(props: NFTAvatarButtonProps) {
    const { onClick, showSettings } = props
    const { classes } = useStyles(undefined, { props })

    return (
        <div className={classes.root} onClick={onClick} role="button">
            <Icons.Avatar className={classes.icon} size={20} />
            <Stack display="inline-flex" gap={1}>
                <Typography style={{ marginLeft: 4 }} className={classes.text}>
                    <Trans>NFT PFP</Trans>
                </Typography>
                {showSettings ?
                    <Icons.GearSettings className={classes.setIcon} />
                :   null}
            </Stack>
        </div>
    )
}
