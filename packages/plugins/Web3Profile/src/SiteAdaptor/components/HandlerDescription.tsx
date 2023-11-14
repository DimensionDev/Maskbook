import { memo, useMemo, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { WalletIcon, SelectProviderModal } from '@masknet/shared'
import {
    useChainContext,
    useNetworkContext,
    useProviderDescriptor,
    useReverseAddress,
    useWallet,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { LensBaseAPI } from '@masknet/web3-providers/types'
import { Icons } from '@masknet/icons'
import { ProfilePopup } from './ProfilePopup.js'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
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
    avatar: {
        objectFit: 'cover',
        borderRadius: 99,
    },
}))

interface HandlerDescriptionProps extends withClasses<'container'> {
    currentProfile?: LensBaseAPI.Profile
    profiles?: LensBaseAPI.Profile[]
    onChange: (profile: LensBaseAPI.Profile) => void
}

export const HandlerDescription = memo<HandlerDescriptionProps>(({ profiles, currentProfile, onChange, ...props }) => {
    const t = useI18N()
    const { classes } = useStyles(undefined, { props })
    const { pluginID } = useNetworkContext()
    const wallet = useWallet()
    const { account, providerType } = useChainContext()
    const Others = useWeb3Others()

    const providerDescriptor = useProviderDescriptor()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const { data: domain } = useReverseAddress(pluginID, account)

    const walletName = useMemo(() => {
        if (domain) return domain
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name
        return providerDescriptor?.name
    }, [account, domain, providerType, wallet?.name, providerDescriptor?.name])

    if (!profiles?.length || !currentProfile) {
        return (
            <Box className={classes.container}>
                <Box className={classes.description}>
                    <WalletIcon size={36} mainIcon={providerDescriptor?.icon} />
                    <Box>
                        <Typography className={classes.name}>{walletName}</Typography>
                        <Typography className={classes.address}>{Others.formatAddress(account, 4)}</Typography>
                    </Box>
                </Box>
                <Button variant="text" onClick={() => SelectProviderModal.open()}>
                    {t.wallet_status_button_change()}
                </Button>
            </Box>
        )
    }

    return (
        <Box className={classes.container}>
            <Box className={classes.description}>
                <WalletIcon
                    classes={{ mainIcon: classes.avatar }}
                    size={36}
                    mainIcon={
                        currentProfile.metadata?.picture?.optimized.uri ||
                        new URL('../assets/Lens.png', import.meta.url).href
                    }
                />
                <Box>
                    <Typography className={classes.name}>{currentProfile.metadata?.displayName}</Typography>
                    <Typography className={classes.address}>{Others.formatAddress(account, 4)}</Typography>
                </Box>
            </Box>
            <Icons.ArrowDrop size={18} onClick={(e) => setAnchorEl(e.currentTarget)} />
            <ProfilePopup
                profiles={profiles}
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                currentProfile={currentProfile}
                onChange={onChange}
            />
        </Box>
    )
})
