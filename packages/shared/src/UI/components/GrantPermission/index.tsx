import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    description: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    action: {
        marginTop: theme.spacing(10),
    },
}))

export interface GrantPermissionsProps extends withClasses<'description' | 'action'> {
    permissions: string[]
    onGrant: () => void
}
export const GrantPermissions = memo<GrantPermissionsProps>(({ permissions, onGrant, ...props }) => {
    const { classes } = useStyles(undefined, { props })
    return (
        <>
            <Typography className={classes.description}>
                <Trans>Mask Network requires the permission of following websites before using it.</Trans>
                <Typography component="div">{permissions.join(',')}</Typography>
            </Typography>
            <ActionButton
                startIcon={<Icons.Approve size={18} sx={{ lineHeight: 1 }} />}
                variant="roundedDark"
                onClick={onGrant}
                className={classes.action}>
                <Trans>Approve</Trans>
            </ActionButton>
        </>
    )
})
