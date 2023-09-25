import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { useSharedTrans } from '../../../locales/i18n_generated.js'

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
    const t = useSharedTrans()
    return (
        <>
            <Typography className={classes.description}>
                {t.authorization_descriptions()}
                <Typography component="div">{permissions.join(',')}</Typography>
            </Typography>
            <ActionButton
                startIcon={<Icons.Approve size={18} sx={{ lineHeight: 1 }} />}
                variant="roundedDark"
                onClick={onGrant}
                className={classes.action}>
                {t.approve()}
            </ActionButton>
        </>
    )
})
