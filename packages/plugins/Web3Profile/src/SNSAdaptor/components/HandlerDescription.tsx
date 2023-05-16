import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletIcon } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import {
    useChainContext,
    useNetworkContext,
    useProviderDescriptor,
    useReverseAddress,
    useWallet,
    useWeb3Connection,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
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

export interface HandlerDescriptionProps extends withClasses<'container'> {
    profile?: {
        avatar?: string
        handle: string
    }
}

export const HandlerDescription = memo<HandlerDescriptionProps>((props) => {
    const t = useI18N()
    const { classes } = useStyles(undefined, { props })
    const { pluginID } = useNetworkContext()
    const wallet = useWallet()
    const { account, providerType } = useChainContext()
    const connection = useWeb3Connection()
    const { Others } = useWeb3State()

    const { data: domain } = useReverseAddress(pluginID, props.profile?.handle ? account : undefined)
    const providerDescriptor = useProviderDescriptor()

    const walletName = useMemo(() => {
        if (props.profile?.handle) return props.profile.handle
        if (domain) return domain
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name
        return providerDescriptor?.name
    }, [
        account,
        domain,
        providerType,
        wallet?.name,
        providerDescriptor?.name,
        Others?.formatAddress,
        props.profile?.handle,
    ])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const handleDisconnect = useCallback(() => connection?.disconnect(), [connection])

    const avatarUrl = useMemo(() => {
        if (!props.profile?.avatar) return
        return resolveIPFS_URL(props.profile?.avatar)
    }, [props.profile?.avatar])

    return (
        <Box className={classes.container}>
            <Box className={classes.description}>
                <WalletIcon
                    size={36}
                    classes={{ mainIcon: props.profile ? classes.avatar : undefined }}
                    mainIcon={
                        props.profile
                            ? avatarUrl
                                ? new URL(avatarUrl)
                                : new URL('../assets/Lens.png', import.meta.url)
                            : providerDescriptor?.icon
                    }
                />
                <Box>
                    <Typography className={classes.name}>{walletName}</Typography>
                    <Typography className={classes.address}>{Others?.formatAddress(account, 4)}</Typography>
                </Box>
            </Box>
            <Button variant="text" onClick={props.profile ? handleDisconnect : openSelectProviderDialog}>
                {props.profile ? t.plugin_wallet_disconnect() : t.wallet_status_button_change()}
            </Button>
        </Box>
    )
})
