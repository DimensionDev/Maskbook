import { Icons } from '@masknet/icons'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import type { LensBaseAPI } from '@masknet/web3-providers/types'
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Popover,
    Radio,
} from '@mui/material'
import { memo } from 'react'
import { Image } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    paper: {
        background: theme.palette.maskColor.bottom,
        width: 320,
        padding: theme.spacing(1.5),
        filter:
            theme.palette.mode === 'light'
                ? 'drop-shadow(0px 4px 30px rgba(0, 0, 0, 0.1))'
                : 'drop-shadow(0px 4px 30px rgba(255, 255, 255, 0.15))',
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 4px 30px 0px rgba(0, 0, 0, 0.1)'
                : '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
    },
    avatar: {
        borderRadius: 99,
    },
    primary: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    second: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
    },
}))

interface ProfilePopupProps {
    anchorEl: HTMLElement | null
    open: boolean
    profiles: LensBaseAPI.Profile[]
    onClose: () => void
    onChange: (profile: LensBaseAPI.Profile) => void
    currentProfile: LensBaseAPI.Profile
}

export const ProfilePopup = memo<ProfilePopupProps>(function ProfilePopup({
    anchorEl,
    open,
    profiles,
    onClose,
    currentProfile,
    onChange,
}) {
    const { classes } = useStyles()

    return usePortalShadowRoot((container) => (
        <Popover
            disableScrollLock
            container={container}
            open={open}
            onClose={onClose}
            anchorEl={anchorEl}
            disableRestoreFocus
            classes={{ paper: classes.paper }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
            <List disablePadding>
                {profiles?.map((profile) => {
                    return (
                        <ListItemButton
                            key={profile.id}
                            onClick={() => {
                                if (currentProfile.id === profile.id) return
                                onChange(profile)
                            }}>
                            <ListItemIcon>
                                {profile.metadata?.picture?.optimized.uri ? (
                                    <Image
                                        className={classes.avatar}
                                        size={36}
                                        src={profile.metadata.picture.optimized.uri}
                                        fallback={<Icons.Lens size={36} className={classes.avatar} />}
                                    />
                                ) : (
                                    <Icons.Lens size={36} className={classes.avatar} />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                classes={{ primary: classes.primary, secondary: classes.second }}
                                primary={profile.metadata?.displayName}
                                secondary={formatEthereumAddress(profile.ownedBy.address, 4)}
                            />
                            <ListItemSecondaryAction>
                                <Radio checked={currentProfile.id === profile.id} />
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    )
                })}
            </List>
        </Popover>
    ))
})
