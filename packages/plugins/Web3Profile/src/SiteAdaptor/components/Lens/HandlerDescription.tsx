import type { Account, AccountAvailable } from '@lens-protocol/client'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { SelectProviderModal, WalletIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import {
    useChainContext,
    useNetworkContext,
    useProviderDescriptor,
    useReverseAddress,
    useWallet,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { LensV3 } from '@masknet/web3-providers'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { ProfilePopup } from '../ProfilePopup.js'

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
        minWidth: 0,
    },
    name: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
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
    currentAccount?: Account
    accounts?: AccountAvailable[] | null
    onChange: (profile: Account) => void
}

export const HandlerDescription = memo<HandlerDescriptionProps>(function HandlerDescription({
    accounts,
    currentAccount,
    onChange,
    ...props
}) {
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
    }, [domain, providerType, wallet?.name, providerDescriptor?.name])

    if (!accounts?.length || !currentAccount) {
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
                    <Trans>Change</Trans>
                </Button>
            </Box>
        )
    }
    const avatar = LensV3.getAccountAvatar(currentAccount) || new URL('../../assets/Lens.png', import.meta.url).href
    const displayName = currentAccount.metadata?.name ?? currentAccount.username?.localName
    return (
        <Box className={classes.container}>
            <Box className={classes.description}>
                <WalletIcon classes={{ mainIcon: classes.avatar }} size={36} mainIcon={avatar} />
                <Box sx={{ minWidth: 0 }}>
                    <TextOverflowTooltip as={ShadowRootTooltip} placement="top" title={displayName}>
                        <Typography className={classes.name}>{displayName}</Typography>
                    </TextOverflowTooltip>
                    <Typography className={classes.address}>{Utils.formatAddress(account, 4)}</Typography>
                </Box>
            </Box>
            <Icons.ArrowDrop size={18} onClick={(e) => setAnchorEl(e.currentTarget)} />
            <ProfilePopup
                walletName={walletName}
                accounts={accounts}
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                currentAccount={currentAccount}
                onChange={onChange}
            />
        </Box>
    )
})
