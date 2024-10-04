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
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import type { LensBaseAPI } from '@masknet/web3-providers/types'
import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { ProfilePopup } from '../ProfilePopup.js'
import { useWeb3ProfileTrans } from '../../../locales/i18n_generated.js'
import { getProfileAvatar } from '../../../utils.js'

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
    const t = useWeb3ProfileTrans()
    const { classes } = useStyles(undefined, { props })
    const { pluginID } = useNetworkContext()
    const wallet = useWallet()
    const { account, providerType } = useChainContext()
    const Utils = useWeb3Utils()

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
        )
    }
    const avatar = getProfileAvatar(currentProfile) || new URL('../../assets/Lens.png', import.meta.url).href

    return (
        <Box className={classes.container}>
            <Box className={classes.description}>
                <WalletIcon classes={{ mainIcon: classes.avatar }} size={36} mainIcon={avatar} />
                <Box>
                    <Typography className={classes.name}>
                        {currentProfile.metadata?.displayName ?? currentProfile.handle.localName}
                    </Typography>
                    <Typography className={classes.address}>{Utils.formatAddress(account, 4)}</Typography>
                </Box>
            </Box>
            <Icons.ArrowDrop size={18} onClick={(e) => setAnchorEl(e.currentTarget)} />
            <ProfilePopup
                walletName={walletName}
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
