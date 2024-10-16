import { Icons } from '@masknet/icons'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import type { LensBaseAPI } from '@masknet/web3-providers/types'
import {
    Box,
    Button,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Popover,
    Radio,
    Typography,
} from '@mui/material'
import { memo } from 'react'
import { Image, SelectProviderModal, WalletIcon } from '@masknet/shared'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useProviderDescriptor, useWeb3Utils } from '@masknet/web3-hooks-base'
import { useWeb3ProfileTrans } from '../../locales/i18n_generated.js'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getProfileAvatar } from '../../utils.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        background: theme.palette.maskColor.bottom,
        width: 320,
        padding: theme.spacing(1.5),
        filter:
            theme.palette.mode === 'light' ?
                'drop-shadow(0px 4px 30px rgba(0, 0, 0, 0.1))'
            :   'drop-shadow(0px 4px 30px rgba(255, 255, 255, 0.15))',
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 4px 30px 0px rgba(0, 0, 0, 0.1)'
            :   '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
    },
    avatar: {
        borderRadius: 99,
    },
    primary: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '18px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        paddingRight: 50,
    },
    second: {
        display: 'flex',
        columnGap: 4,
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        padding: theme.spacing(1.5),
    },
    description: {
        display: 'flex',
        columnGap: 4,
    },
    name: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    address: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    list: {
        maxHeight: 200,
        overflow: 'auto',
        marginBottom: theme.spacing(1.5),
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 18,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
    },
    managedTag: {
        background: theme.palette.maskColor.third,
        color: theme.palette.maskColor.bottom,
        fontSize: 12,
        padding: theme.spacing(0.5),
        borderRadius: 4,
        lineHeight: '12px',
    },
    item: {
        padding: theme.spacing(1.5),
        borderRadius: 8,
    },
    listItemText: {
        margin: 0,
    },
}))

interface ProfilePopupProps {
    anchorEl: HTMLElement | null
    open: boolean
    profiles: LensBaseAPI.Profile[]
    onClose: () => void
    onChange: (profile: LensBaseAPI.Profile) => void
    currentProfile: LensBaseAPI.Profile
    walletName?: string
}

export const ProfilePopup = memo<ProfilePopupProps>(function ProfilePopup({
    anchorEl,
    open,
    profiles,
    onClose,
    currentProfile,
    onChange,
    walletName,
}) {
    const t = useWeb3ProfileTrans()

    const Utils = useWeb3Utils()

    const { classes } = useStyles()

    const { account } = useChainContext()

    const providerDescriptor = useProviderDescriptor()

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
            <List disablePadding className={classes.list}>
                {profiles.map((profile) => {
                    const avatar = getProfileAvatar(profile)
                    return (
                        <ListItemButton
                            className={classes.item}
                            key={profile.id}
                            onClick={() => {
                                if (currentProfile.id === profile.id) return
                                onChange(profile)
                            }}>
                            <ListItemIcon>
                                {avatar ?
                                    <Image
                                        className={classes.avatar}
                                        size={36}
                                        src={avatar}
                                        fallback={<Icons.Lens size={36} className={classes.avatar} />}
                                    />
                                :   <Icons.Lens size={36} className={classes.avatar} />}
                            </ListItemIcon>
                            <ListItemText
                                classes={{ primary: classes.primary, root: classes.listItemText }}
                                primary={profile.metadata?.displayName ?? profile.handle?.localName}
                                secondary={
                                    <div className={classes.second}>
                                        <Typography component="div" className={classes.address}>
                                            {formatEthereumAddress(profile.ownedBy.address, 4)}
                                        </Typography>
                                        {!isSameAddress(profile.ownedBy.address, account) ?
                                            <Typography component="span" className={classes.managedTag}>
                                                Managed
                                            </Typography>
                                        :   null}
                                    </div>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Radio checked={currentProfile.id === profile.id} />
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    )
                })}
            </List>
            <Box className={classes.container}>
                <Box className={classes.description}>
                    <WalletIcon size={36} mainIcon={providerDescriptor?.icon} />
                    <Box>
                        <Typography className={classes.name}>{walletName}</Typography>
                        <Typography className={classes.address}>{Utils.formatAddress(account, 4)}</Typography>
                    </Box>
                </Box>
                <Button
                    variant="text"
                    onClick={() =>
                        SelectProviderModal.open({
                            requiredSupportPluginID: NetworkPluginID.PLUGIN_EVM,
                            requiredSupportChainIds: [ChainId.Polygon],
                        })
                    }>
                    {t.wallet_status_button_change()}
                </Button>
            </Box>
        </Popover>
    ))
})
