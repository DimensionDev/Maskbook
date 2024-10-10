import { Icons } from '@masknet/icons'
import { WalletIcon, FormattedBalance, PopupHomeTabType } from '@masknet/shared'
import { PopupRoutes, type BindingProof } from '@masknet/shared-base'
import {
    useWallets,
    useDefaultChainId,
    useNetworkDescriptor,
    useWeb3Utils,
    useReverseAddress,
    useNativeTokenBalance,
    useNativeToken,
} from '@masknet/web3-hooks-base'
import { resolveNextID_NetworkPluginID, isSameAddress, formatBalance } from '@masknet/web3-shared-base'
import {
    ListItem,
    Switch,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme,
    Link,
    Box,
    List,
} from '@mui/material'
import { useMemo, useCallback, memo } from 'react'
import { MaskSharedTrans } from '../../../shared-ui/index.js'
import { LoadingBase } from '@masknet/theme'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { Trans } from '@lingui/macro'

interface WalletItemProps {
    proof: BindingProof
    toggleUnlisted: (identity: string, address: string) => void
    profileIdentity?: string
    checked: boolean
}

function WalletItem({ proof, toggleUnlisted, profileIdentity, checked }: WalletItemProps) {
    const theme = useTheme()
    const wallets = useWallets()
    const networkPluginId = resolveNextID_NetworkPluginID(proof.platform)
    const chainId = useDefaultChainId(networkPluginId)
    const networkDescriptor = useNetworkDescriptor(networkPluginId, chainId)
    const Utils = useWeb3Utils(networkPluginId)
    const { data: domain } = useReverseAddress(networkPluginId, proof.identity)

    const formattedAddress = Utils.formatAddress(proof.identity, 4)
    const addressLink = Utils.explorerResolver.addressLink(chainId, proof.identity)

    const balance = useNativeTokenBalance(networkPluginId, { account: proof.identity, chainId })
    const { data: nativeToken } = useNativeToken(networkPluginId, { chainId })

    const walletName = useMemo(() => {
        if (domain) return domain
        const walletAtDB = wallets.find((x) => isSameAddress(proof.identity, x.address))
        if (walletAtDB) return walletAtDB.name
        return formattedAddress
    }, [domain, wallets, proof.identity, formattedAddress])

    const handleSwitch = useCallback(() => {
        if (!profileIdentity) return
        toggleUnlisted(profileIdentity, proof.identity)
    }, [toggleUnlisted, profileIdentity, proof.identity])

    return (
        <ListItem sx={{ padding: 0 }} secondaryAction={<Switch checked={checked} onChange={handleSwitch} />}>
            <ListItemButton
                sx={{ borderRadius: 2, '&:hover': { background: theme.palette.maskColor.bg }, padding: 1.5 }}>
                <ListItemIcon style={{ minWidth: 30 }}>
                    <WalletIcon mainIcon={networkDescriptor?.icon} />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography fontSize={12} fontWeight={700} lineHeight="16px" display="flex" alignItems="center">
                            {walletName}
                            <Link
                                underline="none"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={addressLink}
                                width={14}
                                height={14}>
                                <Icons.LinkOut size={14} color={theme.palette.maskColor.main} />
                            </Link>
                        </Typography>
                    }
                    secondary={
                        <Typography fontSize={12} color={theme.palette.maskColor.second} lineHeight="16px">
                            <FormattedBalance
                                value={balance.value}
                                decimals={nativeToken?.decimals}
                                formatter={formatBalance}
                                symbol={nativeToken?.symbol}
                            />
                        </Typography>
                    }
                />
            </ListItemButton>
        </ListItem>
    )
}

interface WalletListProps {
    isValid?: boolean
    walletProofs?: BindingProof[]
    listingAddresses: string[]
    toggleUnlisted: (identity: string, address: string) => void
    loading: boolean
    identity?: string
}

export const WalletList = memo<WalletListProps>(function WalletList({
    walletProofs,
    listingAddresses,
    toggleUnlisted,
    loading,
    isValid,
    identity,
}) {
    const theme = useTheme()
    const navigate = useNavigate()
    if (!isValid) return null

    if (loading)
        return (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                <LoadingBase size={36} />
                <Typography mt={1.5}>
                    <Trans>Loading</Trans>
                </Typography>
            </Box>
        )

    if (!walletProofs?.length)
        return (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                <Icons.EmptySimple size={36} />
                <Typography fontSize={14} color={theme.palette.maskColor.second} mt={1.5} textAlign="center">
                    {/* eslint-disable-next-line react/naming-convention/component-name */}
                    <MaskSharedTrans.popups_empty_wallet_proofs_tips
                        components={{
                            strong: (
                                <strong
                                    onClick={() =>
                                        navigate(
                                            urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }),
                                        )
                                    }
                                    style={{ display: 'block', color: theme.palette.maskColor.main, cursor: 'pointer' }}
                                />
                            ),
                        }}
                    />
                </Typography>
            </Box>
        )

    return (
        <List>
            {walletProofs.map((proof, index) => (
                <WalletItem
                    checked={listingAddresses.includes(proof.identity)}
                    proof={proof}
                    key={index}
                    toggleUnlisted={toggleUnlisted}
                    profileIdentity={identity}
                />
            ))}
        </List>
    )
})
