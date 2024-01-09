import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { Avatar } from '@mui/material'
import { Icons } from '@masknet/icons'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { EnhanceableSite } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'relative',
        width: 40,
        height: 40,
    },
    avatar: {
        width: 40,
        height: 40,
        fontSize: 60,
        borderRadius: 99,
    },
    network: {
        height: 14,
        width: 14,
        borderRadius: 99,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        right: -7,
        bottom: 0,
    },
    valid: {
        width: 6,
        height: 6,
        borderRadius: 99,
        border: `1px solid ${theme.palette.maskColor.bottom}`,
        position: 'absolute',
        top: 3,
        right: 2,
        backgroundColor: theme.palette.maskColor.warn,
    },
}))

export interface AccountAvatar extends withClasses<'avatar' | 'container'> {
    avatar?: string | null
    network?: string
    isValid?: boolean
    size?: number
}

export const AccountAvatar = memo<AccountAvatar>(({ avatar, network, isValid, ...props }) => {
    const { classes } = useStyles(undefined, { props })

    const Icon = network ? SOCIAL_MEDIA_ROUND_ICON_MAPPING[network] : null

    return (
        <div className={classes.container}>
            {avatar ?
                <Avatar className={classes.avatar} src={avatar}>
                    <Icons.GrayMasks className={classes.avatar} />
                </Avatar>
            :   <Icons.GrayMasks className={classes.avatar} />}
            {Icon ?
                <div className={classes.network}>
                    <Icon size={14} />
                </div>
            :   null}
            {!isValid && network === EnhanceableSite.Twitter ?
                <div className={classes.valid} />
            :   null}
        </div>
    )
})
