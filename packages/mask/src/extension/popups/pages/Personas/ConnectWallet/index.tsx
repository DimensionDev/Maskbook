import { memo, useCallback, useMemo } from 'react'
import urlcat from 'urlcat'
import { useAsync, useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { Avatar, Box, Button, Link, Typography } from '@mui/material'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import {
    NextIDPlatform,
    type NetworkPluginID,
    NextIDAction,
    SignType,
    type NextIDPayload,
    PopupRoutes,
    PopupModalRoutes,
    MaskMessages,
} from '@masknet/shared-base'
import { formatDomainName, formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { FormattedAddress, PersonaContext, WalletIcon } from '@masknet/shared'
import { ExplorerResolver, NextIDProof, ProviderResolver, Web3 } from '@masknet/web3-providers'
import {
    useChainContext,
    useNetworkContext,
    useProviderDescriptor,
    useReverseAddress,
    useWallets,
} from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { LoadingMask } from '../../../components/LoadingMask/index.js'
import Services from '../../../../service.js'
import { HomeTabType } from '../../Wallet/type.js'
import { useModalNavigate } from '../../../components/index.js'

const useStyles = makeStyles()((theme) => ({
    provider: {
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountInfo: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 10,
        lineHeight: '10px',
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        color: theme.palette.maskColor.second,
        height: 10,
    },
    description: {
        marginTop: theme.spacing(1.5),
        fontSize: 12,
        lineHeight: '16px',
        color: theme.palette.maskColor.second,
    },
    bounded: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.danger,
        marginTop: theme.spacing(1.5),
    },
    congratulation: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        fontWeight: 700,
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 160,
        rowGap: 4,
    },
    name: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
}))

const ConnectWalletPage = memo(function ConnectWalletPage() {
    const { t } = useI18N()

    const { classes } = useStyles()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const { showSnackbar } = usePopupCustomSnackbar()

    const { pluginID } = useNetworkContext<NetworkPluginID.PLUGIN_EVM>()

    const { providerType, chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const wallets = useWallets(pluginID)

    const providerDescriptor = useProviderDescriptor(pluginID, providerType)
    const { data: domain } = useReverseAddress(pluginID, account)
    const { currentPersona } = PersonaContext.useContainer()

    const { value: isBound } = useAsync(async () => {
        if (!account || !currentPersona?.identifier.publicKeyAsHex) return false
        return NextIDProof.queryIsBound(currentPersona.identifier.publicKeyAsHex, NextIDPlatform.Ethereum, account)
    }, [account, currentPersona?.identifier.publicKeyAsHex])

    const walletAlias = useMemo(() => {
        if (domain) return formatDomainName(domain)
        if (providerType !== ProviderType.MaskWallet) return `${ProviderResolver.providerName(providerType)} Wallet`
        return wallets.find((x) => isSameAddress(x.address, account))?.name ?? formatEthereumAddress(account, 4)
    }, [JSON.stringify(wallets), account, domain, providerType])

    const walletName = useMemo(() => {
        if (providerType === ProviderType.MaskWallet)
            return (
                wallets.find((x) => isSameAddress(x.address, account))?.name ??
                (domain || formatEthereumAddress(account, 4))
            )

        return domain || formatEthereumAddress(account, 4)
    }, [providerType, account, domain, JSON.stringify(wallets)])

    const bindProof = useCallback(
        async (payload: NextIDPayload, walletSignature: string, signature: string) => {
            if (!currentPersona) return
            try {
                await NextIDProof.bindProof(
                    payload.uuid,
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Create,
                    NextIDPlatform.Ethereum,
                    account,
                    payload.createdAt,
                    {
                        walletSignature,
                        signature,
                    },
                )

                return true
            } catch {
                showSnackbar(t('popups_verify_wallet_bind_fail_tips'), {
                    variant: 'error',
                })
                return false
            }
        },
        [account, currentPersona],
    )

    const [{ value: signResult, loading }, handleSign] = useAsyncFn(async () => {
        try {
            if (!currentPersona?.identifier || !account) return
            const payload = await NextIDProof.createPersonaPayload(
                currentPersona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                account,
                NextIDPlatform.Ethereum,
                'default',
            )

            if (!payload) return
            const personaSignature = await Services.Identity.signWithPersona(
                SignType.Message,
                payload.signPayload,
                currentPersona.identifier,
                true,
            )

            const walletSignature = await Web3.signMessage('message', payload.signPayload, {
                chainId,
                account,
                providerType,
                silent: providerType === ProviderType.MaskWallet,
            })

            const result = await bindProof(payload, walletSignature, personaSignature)

            if (result) showSnackbar(t('popups_verify_wallet_sign_success_tips'))
            // Broadcast updates
            MaskMessages.events.ownProofChanged.sendToAll()
            return true
        } catch (error) {
            showSnackbar(t('popups_verify_wallet_sign_fail_tips'), {
                variant: 'error',
            })
            return false
        }
    }, [currentPersona, account, chainId, account, providerType, bindProof])

    const handleCancel = useCallback(async () => {
        if (providerType === ProviderType.MaskWallet || providerType === ProviderType.WalletConnect) {
            navigate(-1)
            return
        }
        await Services.Helper.removePopupWindow()
    }, [signResult])

    const handleChooseAnotherWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.SelectProvider, {
            disableNewWindow: true,
        })
    }, [modalNavigate])

    const handleDone = useCallback(async () => {
        await Web3.disconnect({ providerType })
        if (providerType === ProviderType.MaskWallet || providerType === ProviderType.WalletConnect) {
            navigate(-1)
            return
        }
        await Services.Helper.removePopupWindow()
    }, [providerType])

    const handleBack = useCallback(() => {
        navigate(urlcat(PopupRoutes.Personas, { tab: HomeTabType.ConnectedWallets, disableNewWindow: true }), {
            replace: true,
        })
    }, [])

    useTitle(t('plugin_wallet_connect_a_wallet'), handleBack)

    return (
        <Box>
            {!signResult ? (
                <Box p={2}>
                    <Box className={classes.provider}>
                        <Box className={classes.accountInfo}>
                            <WalletIcon size={30} mainIcon={providerDescriptor?.icon} />
                            <Box>
                                <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                                    {walletAlias}
                                </Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress address={account} size={4} formatter={formatEthereumAddress} />
                                    <Link
                                        className={classes.link}
                                        href={account ? ExplorerResolver.addressLink(chainId, account) : '#'}
                                        target="_blank"
                                        title={t('plugin_wallet_view_on_explorer')}
                                        rel="noopener noreferrer">
                                        <Icons.LinkOut size={12} />
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                        <Button size="small" onClick={handleChooseAnotherWallet}>
                            {t('wallet_status_button_change')}
                        </Button>
                    </Box>
                    {isBound ? (
                        <Typography className={classes.bounded}>
                            {t('popups_verify_wallet_bounded_tips', { persona: currentPersona?.nickname })}
                        </Typography>
                    ) : null}
                    <Typography className={classes.description}>{t('popups_verify_wallet_description')}</Typography>
                    {loading ? <LoadingMask text={t('signing')} /> : null}
                </Box>
            ) : (
                <Box p={2} display="flex" flexDirection="column" alignItems="center">
                    <Typography sx={{ mt: 3, textAlign: 'center' }} fontSize={36}>
                        &#x1F389;
                    </Typography>
                    <Typography fontSize={24} lineHeight="120%" fontWeight={700} my={1.5}>
                        {t('congratulations')}
                    </Typography>
                    <Typography className={classes.congratulation}>
                        {t('popups_verify_wallet_congratulation_tips', {
                            persona: currentPersona?.nickname,
                            wallet: walletName,
                        })}
                    </Typography>
                    <Box display="flex" py={3} px={1.5} alignItems="center">
                        <Box className={classes.info}>
                            {currentPersona?.avatar ? (
                                <Avatar src={currentPersona.avatar} style={{ width: 36, height: 36 }} />
                            ) : (
                                <Icons.MenuPersonasActive size={36} style={{ borderRadius: 99 }} />
                            )}
                            <Typography className={classes.name}>{currentPersona?.nickname}</Typography>
                        </Box>
                        <Icons.Connect size={24} />
                        <Box className={classes.info}>
                            <WalletIcon size={30} mainIcon={providerDescriptor?.icon} />
                            <Typography className={classes.name}>{walletName}</Typography>
                        </Box>
                    </Box>
                </Box>
            )}
            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleCancel}>
                    {t('cancel')}
                </Button>
                {!signResult ? (
                    <ActionButton fullWidth onClick={handleSign} disabled={loading || isBound}>
                        {t('sign')}
                    </ActionButton>
                ) : (
                    <ActionButton fullWidth onClick={handleDone}>
                        {t('done')}
                    </ActionButton>
                )}
            </BottomController>
        </Box>
    )
})

export default ConnectWalletPage
