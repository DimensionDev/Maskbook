import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { Avatar } from '@mui/material'
import { Icons } from '@masknet/icons'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { EnhanceableSite } from '@masknet/web3-shared-base'

const useStyles = makeStyles()(() => ({
    container: {
        position: 'relative',
        width: 60,
        height: 60,
    },
    avatar: {
        width: 60,
        height: 60,
        fontSize: 60,
        borderRadius: 99,
        border: '1px solid #e6e7e8',
    },
    network: {
        height: 24,
        width: 24,
        borderRadius: 99,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        right: -10,
        bottom: 2,
    },
    valid: {
        width: 10,
        height: 10,
        borderRadius: 99,
        border: '1px solid #ffffff',
        position: 'absolute',
        top: 3,
        right: -3,
        backgroundColor: '#FFB100',
    },
}))

export interface AccountAvatar {
    avatar?: string | null
    network?: string
    isValid?: boolean
}

export const AccountAvatar = memo<AccountAvatar>(({ avatar, network, isValid }) => {
    const { classes } = useStyles()

    const Icon = network ? SOCIAL_MEDIA_ROUND_ICON_MAPPING[network] : null

    return (
        <div className={classes.container}>
            {avatar ? (
                <Avatar className={classes.avatar} src={avatar} />
            ) : (
                <Icons.GrayMasks className={classes.avatar} />
            )}
            {Icon ? (
                <div className={classes.network}>
                    <Icon size={24} />
                </div>
            ) : null}
            {!isValid && network === EnhanceableSite.Twitter ? <div className={classes.valid} /> : null}
        </div>
    )
})
