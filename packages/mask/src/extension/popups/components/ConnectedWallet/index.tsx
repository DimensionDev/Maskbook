import { memo, useCallback } from 'react'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { Box, Link, Typography, useTheme } from '@mui/material'
import type { ConnectedWalletInfo } from '../../pages/Personas/type.js'
import { MaskMessages, NetworkPluginID, NextIDAction, PopupModalRoutes, SignType } from '@masknet/shared-base'
import { useChainContext, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { FormattedAddress, ImageIcon, PersonaContext } from '@masknet/shared'
import { ChainId, explorerResolver, formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Trans } from 'react-i18next'
import { DisconnectModal } from '../../modals/modals.js'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../service.js'
import { useModalNavigate } from '../index.js'
import { SelectProvider } from '../SelectProvider/index.js'

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
        display: 'flex',
        alignItems: 'center',
        columnGap: theme.spacing(0.25),
    },
    address: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.palette.maskColor.second,
    },
    connect: {
        cursor: 'pointer',
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.bg,
        columnGap: 4,
    },
}))

export interface ConnectedWalletProps {
    wallets?: ConnectedWalletInfo[]
}

export const ConnectedWallet = memo<ConnectedWalletProps>(function ConnectedWallet({ wallets }) {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { showSnackbar } = usePopupCustomSnackbar()
    const { currentPersona } = PersonaContext.useContainer()
    const modalNavigate = useModalNavigate()

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
                showSnackbar(t('popups_wallet_disconnect_success'))
            } catch {
                showSnackbar(t('popups_wallet_disconnect_failed'))
            }
        },
        [currentPersona],
    )

    if (!wallets?.length) {
        return <SelectProvider />
    }

    return (
        <Box className={classes.walletList}>
            {wallets.map((wallet, index) => (
                <Box className={classes.wallet} key={index}>
                    <Box display="flex" alignItems="center">
                        <ImageIcon size={24} icon={networkDescriptor?.icon} className={classes.walletIcon} />
                        <Typography className={classes.walletInfo} component="div">
                            <Typography className={classes.walletName}>
                                <Typography
                                    component="span"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    maxWidth="100px"
                                    overflow="hidden">
                                    {formatDomainName(wallet.name, 10)}
                                </Typography>
                                <Link
                                    style={{ width: 16, height: 16, color: 'inherit' }}
                                    href={explorerResolver.addressLink(chainId, wallet.identity ?? '')}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Icons.LinkOut size={16} sx={{ ml: 0.25 }} />
                                </Link>
                            </Typography>
                            <Typography component="span" className={classes.address}>
                                <FormattedAddress
                                    address={wallet.identity}
                                    size={4}
                                    formatter={formatEthereumAddress}
                                />
                            </Typography>
                        </Typography>
                    </Box>
                    <Icons.Disconnect
                        size={16}
                        onClick={async () => {
                            if (!currentPersona) return
                            const confirmed = await DisconnectModal.openAndWaitForClose({
                                title: t('popups_release_bind_wallet_title'),
                                tips: (
                                    <Trans
                                        i18nKey="popups_wallet_disconnect_tips"
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
            ))}
            <Box className={classes.connect} onClick={() => modalNavigate(PopupModalRoutes.SelectProvider)}>
                <Icons.Connect size={16} />
                <Typography fontSize={12} fontWeight={700} lineHeight="16px">
                    {t('connect')}
                </Typography>
            </Box>
        </Box>
    )
})
