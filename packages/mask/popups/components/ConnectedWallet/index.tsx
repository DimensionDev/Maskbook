import { Icons } from '@masknet/icons'
import { ConfirmDialog, FormattedAddress, ImageIcon, PersonaContext, ProgressiveText } from '@masknet/shared'
import { MaskMessages, NetworkPluginID, NextIDAction, PopupModalRoutes, SignType } from '@masknet/shared-base'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useChainContext, useNetworkDescriptor, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, resolveNextIDPlatformWalletName } from '@masknet/web3-shared-base'
import { ChainId, formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Link, Typography, useTheme } from '@mui/material'
import { useQueries } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { MaskSharedTrans } from '../../../shared-ui/index.js'
import Services from '#services'
import type { ConnectedWalletInfo } from '../../pages/Personas/type.js'
import { useModalNavigate } from '../ActionModal/index.js'
import { useVerifiedWallets } from '../../hooks/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    walletList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
    },
    wallet: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderRadius: 16,
        '&:hover': {
            background: theme.palette.maskColor.bottom,
            boxShadow: theme.palette.maskColor.bottomBg,
        },
    },
    walletInfo: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
        marginLeft: theme.spacing(0.75),
    },
    walletIcon: {
        boxShadow: '0px 4px 10px 0px rgba(0, 60, 216, 0.20)',
        borderRadius: 12,
    },
    walletName: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 100,
        overflow: 'hidden',
    },
    address: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    connect: {
        cursor: 'pointer',
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.bg,
        columnGap: 4,
        padding: '21px 0',
    },
}))

export const ConnectedWallet = memo(function ConnectedWallet() {
    const theme = useTheme()
    const { classes } = useStyles()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const localWallets = useWallets()
    const { showSnackbar } = usePopupCustomSnackbar()
    const { currentPersona, proofs } = PersonaContext.useContainer()
    const modalNavigate = useModalNavigate()
    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const wallets = useVerifiedWallets(proofs)

    const queries = useQueries({
        queries: wallets.map((wallet, index) => ({
            enabled: !!NameService,
            queryKey: ['persona-connected-wallet', wallet.identity, index],
            queryFn: async () => {
                const domain = await NameService?.reverse?.(wallet.identity)
                if (domain) return domain
                const localWallet = localWallets.find((x) => isSameAddress(x.address, wallet.identity))?.name
                return localWallet || null
            },
        })),
    })

    // TODO: remove this after next dot id support multiple chain
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, ChainId.Mainnet)

    const handleConfirmRelease = useCallback(
        async (wallet?: ConnectedWalletInfo) => {
            try {
                if (!currentPersona?.identifier.publicKeyAsHex || !wallet) return

                const result = await NextIDProof.createPersonaPayload(
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.identity,
                    wallet.platform,
                )

                if (!result) return

                const signature = await Services.Identity.signWithPersona(
                    SignType.Message,
                    result.signPayload,
                    currentPersona.identifier,
                    location.origin,
                    true,
                )

                if (!signature) return

                await NextIDProof.bindProof(
                    result.uuid,
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.platform,
                    wallet.identity,
                    result.createdAt,
                    { signature },
                )

                // Broadcast updates.
                MaskMessages.events.ownProofChanged.sendToAll()
                showSnackbar(<Trans>Wallet disconnected</Trans>)
            } catch {
                showSnackbar(<Trans>Failed to disconnect wallet</Trans>, {
                    variant: 'error',
                })
            }
        },
        [currentPersona],
    )

    return (
        <Box className={classes.walletList}>
            {wallets.map((wallet, index) => {
                const query = queries[index]
                let walletName = query.data || ''
                if (!walletName && !query.isPending) {
                    walletName = `${resolveNextIDPlatformWalletName(wallet.platform)} ${wallets.length - index}`
                }
                return (
                    <Box className={classes.wallet} key={index}>
                        <Box display="flex" alignItems="center">
                            <ImageIcon size={24} icon={networkDescriptor?.icon} className={classes.walletIcon} />
                            <Typography className={classes.walletInfo} component="div">
                                <ProgressiveText
                                    className={classes.walletName}
                                    component="span"
                                    skeletonWidth={60}
                                    skeletonHeight={16}
                                    loading={query.isPending}>
                                    {formatDomainName(walletName, 13)}
                                </ProgressiveText>

                                <Typography component="span" className={classes.address}>
                                    <FormattedAddress
                                        address={wallet.identity}
                                        size={4}
                                        formatter={formatEthereumAddress}
                                    />
                                    <Link
                                        style={{ width: 14, height: 14, color: theme.palette.maskColor.main }}
                                        href={EVMExplorerResolver.addressLink(chainId, wallet.identity ?? '')}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <Icons.LinkOut size={14} sx={{ ml: 0.25 }} />
                                    </Link>
                                </Typography>
                            </Typography>
                        </Box>
                        <Icons.Disconnect
                            size={16}
                            onClick={async () => {
                                if (!currentPersona) return
                                const confirmed = await ConfirmDialog.openAndWaitForClose({
                                    title: <Trans>Disconnect Wallet?</Trans>,
                                    confirmVariant: 'warning',
                                    message: (
                                        // eslint-disable-next-line react/naming-convention/component-name
                                        <MaskSharedTrans.popups_wallet_disconnect_tips
                                            components={{
                                                strong: <strong style={{ color: theme.palette.maskColor.main }} />,
                                            }}
                                            values={{
                                                wallet: formatEthereumAddress(wallet.identity, 4),
                                            }}
                                        />
                                    ),
                                })
                                if (confirmed) return handleConfirmRelease(wallet)
                            }}
                        />
                    </Box>
                )
            })}
            <Box className={classes.connect} onClick={() => modalNavigate(PopupModalRoutes.SelectProvider)}>
                <Icons.Connect size={16} />
                <Typography fontSize={12} fontWeight={700} lineHeight="16px">
                    <Trans>Connect</Trans>
                </Typography>
            </Box>
        </Box>
    )
})
