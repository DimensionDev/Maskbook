import { Icons } from '@masknet/icons'
import { WalletIcon, FormattedBalance } from '@masknet/shared'
import type { BindingProof } from '@masknet/shared-base'
import {
    useWallets,
    useDefaultChainId,
    useNetworkDescriptor,
    useWeb3Others,
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
import { Trans } from 'react-i18next'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { LoadingBase } from '@masknet/theme'

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
    const Others = useWeb3Others(networkPluginId)
    const { data: domain } = useReverseAddress(networkPluginId, proof.identity)

    const formattedAddress = Others.formatAddress(proof.identity, 4)
    const addressLink = Others.explorerResolver.addressLink(chainId, proof.identity)

    const balance = useNativeTokenBalance(networkPluginId, { account: proof.identity })
    const { data: nativeToken } = useNativeToken(networkPluginId)

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
                                width={16}
                                height={16}>
                                <Icons.LinkOut size={16} color={theme.palette.maskColor.main} />
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
    const { t } = useI18N()
    const theme = useTheme()
    if (!isValid) return null

    if (loading)
        return (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                <LoadingBase size={36} />
                <Typography mt={1.5}>{t('loading')}</Typography>
            </Box>
        )

    if (!walletProofs?.length)
        return (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                <Icons.EmptySimple size={36} />
                <Typography fontSize={14} color={theme.palette.maskColor.second} mt={1.5}>
                    <Trans i18nKey="popups_empty_wallet_proofs_tips" components={{ strong: <strong /> }} />
                </Typography>
            </Box>
        )

    return (
        <List>
            {walletProofs?.map((proof, index) => (
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
