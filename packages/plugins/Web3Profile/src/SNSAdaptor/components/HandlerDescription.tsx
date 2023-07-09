import { memo, useCallback, useMemo } from 'react'
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
import { Web3 } from '@masknet/web3-providers'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
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
    const Others = useWeb3Others()

    const { data: domain } = useReverseAddress(pluginID, props.profile?.handle ? account : undefined)
    const providerDescriptor = useProviderDescriptor()

    const walletName = useMemo(() => {
        if (props.profile?.handle) return props.profile.handle
        if (domain) return domain
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name
        return providerDescriptor?.name
    }, [account, domain, providerType, wallet?.name, providerDescriptor?.name, props.profile?.handle])

    const handleDisconnect = useCallback(() => Web3.disconnect(), [])

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
                                ? avatarUrl
                                : new URL('../assets/Lens.png', import.meta.url).href
                            : providerDescriptor?.icon
                    }
                />
                <Box>
                    <Typography className={classes.name}>{walletName}</Typography>
                    <Typography className={classes.address}>{Others.formatAddress(account, 4)}</Typography>
                </Box>
            </Box>
            <Button variant="text" onClick={props.profile ? handleDisconnect : () => SelectProviderModal.open()}>
                {props.profile ? t.plugin_wallet_disconnect() : t.wallet_status_button_change()}
            </Button>
        </Box>
    )
})
