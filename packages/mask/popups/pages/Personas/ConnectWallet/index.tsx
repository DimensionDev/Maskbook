import { Icons } from '@masknet/icons'
import { FormattedAddress, PersonaContext, PopupHomeTabType } from '@masknet/shared'
import {
    MaskMessages,
    NextIDAction,
    NextIDPlatform,
    PopupModalRoutes,
    PopupRoutes,
    SignType,
    type NetworkPluginID,
    type NextIDPayload,
} from '@masknet/shared-base'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import {
    useChainContext,
    useNetworkContext,
    usePrivyWallet,
    useReverseAddress,
    useWallets,
} from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, EVMProviderResolver, EVMWeb3, NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EthereumMethodType, formatDomainName, formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, Link, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import urlcat from 'urlcat'

import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { BottomController } from '../../../components/BottomController/index.js'
import { useModalNavigate } from '../../../components/index.js'
import { LoadingMask } from '../../../components/LoadingMask/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletAvatar } from '../../../components/WalletAvatar/index.js'

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

export const Component = memo(function ConnectWalletPage() {
    const { t } = useLingui()

    const { classes } = useStyles()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const { showSnackbar } = usePopupCustomSnackbar()

    const { pluginID } = useNetworkContext<NetworkPluginID.PLUGIN_EVM>()

    const { providerType, chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const wallets = useWallets()

    const { data: domain } = useReverseAddress(pluginID, account)
    const { currentPersona } = PersonaContext.useContainer()

    const { value: isBound } = useAsync(async () => {
        if (!account || !currentPersona?.identifier.publicKeyAsHex) return false
        return NextIDProof.queryIsBound(currentPersona.identifier.publicKeyAsHex, NextIDPlatform.Ethereum, account)
    }, [account, currentPersona?.identifier.publicKeyAsHex])

    const walletAlias = (() => {
        if (domain) return formatDomainName(domain)
        if (providerType !== ProviderType.MaskWallet) return `${EVMProviderResolver.providerName(providerType)} Wallet`
        return wallets.find((x) => isSameAddress(x.address, account))?.name ?? formatEthereumAddress(account, 4)
    })()

    const walletName = (() => {
        if (providerType === ProviderType.MaskWallet)
            return (
                wallets.find((x) => isSameAddress(x.address, account))?.name ??
                (domain || formatEthereumAddress(account, 4))
            )

        return domain || formatEthereumAddress(account, 4)
    })()

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
                showSnackbar(<Trans>Failed to add the wallet, please try again.</Trans>, {
                    variant: 'error',
                })
                return false
            }
        },
        [account, currentPersona],
    )

    const privyWallet = usePrivyWallet(account)
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
                { type: SignType.Message, data: payload.signPayload },
                currentPersona.identifier,
                location.origin,
                true,
            )

            let walletSignature = ''
            if (privyWallet?.isConnected) {
                const provider = await privyWallet.getEthereumProvider()
                walletSignature = await provider.request({
                    method: EthereumMethodType.personal_sign,
                    params: [payload.signPayload, account],
                })
            } else {
                walletSignature = await EVMWeb3.signMessage('message', payload.signPayload, {
                    chainId,
                    account,
                    providerType,
                    silent: providerType === ProviderType.MaskWallet,
                })
            }

            const result = await bindProof(payload, walletSignature, personaSignature)

            if (result) showSnackbar(<Trans>You have signed with your wallet.</Trans>)

            // Broadcast updates
            MaskMessages.events.ownProofChanged.sendToAll()
            return true
        } catch (error) {
            showSnackbar(<Trans>Sorry, signature failed! Please try signing again.</Trans>, {
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
        // reset to MaskWallet after cancellation
        const maskAccount = wallets.some((x) => isSameAddress(x.address, account)) ? account : wallets[0].address
        await EVMWeb3.connect({
            providerType: ProviderType.MaskWallet,
            account: maskAccount,
        })
        await Services.Helper.removePopupWindow()
    }, [signResult, wallets, account, navigate, providerType])

    const handleChooseAnotherWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.SelectProvider)
    }, [modalNavigate])

    const handleDone = useCallback(async () => {
        if (providerType !== ProviderType.MaskWallet) await EVMWeb3.disconnect({ providerType })
        if (providerType === ProviderType.MaskWallet) {
            navigate(-1)
            return
        }
        if (providerType === ProviderType.WalletConnect) {
            navigate(urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }), {
                replace: true,
            })
        }
        await Services.Helper.removePopupWindow()
    }, [providerType, navigate])

    const handleBack = useCallback(() => {
        navigate(urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }), {
            replace: true,
        })
    }, [])

    useTitle(t`Connect Wallet`, handleBack)

    return (
        <Box>
            {!signResult ?
                <Box p={2}>
                    <Box className={classes.provider}>
                        <Box className={classes.accountInfo}>
                            <WalletAvatar address={account} size={30} />
                            <Box>
                                <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                                    {walletAlias}
                                </Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress address={account} size={4} formatter={formatEthereumAddress} />
                                    <Link
                                        className={classes.link}
                                        href={account ? EVMExplorerResolver.addressLink(chainId, account) : '#'}
                                        target="_blank"
                                        title={t`View on Explorer`}
                                        rel="noopener noreferrer">
                                        <Icons.LinkOut size={12} />
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                        <Button size="small" onClick={handleChooseAnotherWallet}>
                            <Trans>Change</Trans>
                        </Button>
                    </Box>
                    {isBound ?
                        <Typography className={classes.bounded}>
                            <Trans>
                                This wallet is connected to current persona {String(currentPersona?.nickname)}.
                            </Trans>
                        </Typography>
                    :   null}
                    <Typography className={classes.description}>
                        <Trans>
                            Adding your wallets will allow you to own, view, and utilize your digital identities via
                            Next.ID service. Note that you will be required to sign and authenticate the transaction to
                            prove ownership of your wallet.
                        </Trans>
                    </Typography>
                    {loading ?
                        <LoadingMask text={<Trans>Signing ...</Trans>} />
                    :   null}
                </Box>
            :   <Box p={2} display="flex" flexDirection="column" alignItems="center">
                    <Typography sx={{ mt: 3, textAlign: 'center' }} fontSize={36}>
                        🎉
                    </Typography>
                    <Typography fontSize={24} lineHeight="120%" fontWeight={700} my={1.5}>
                        <Trans>Congratulations</Trans>
                    </Typography>
                    <Typography className={classes.congratulation}>
                        <Trans>
                            Connected {currentPersona?.nickname} with {walletName}.
                        </Trans>
                    </Typography>
                    <Box display="flex" py={3} px={1.5} alignItems="center">
                        <Box className={classes.info}>
                            {currentPersona?.avatar ?
                                <Avatar src={currentPersona.avatar} style={{ width: 36, height: 36 }} />
                            :   <Icons.MenuPersonasActive size={36} style={{ borderRadius: 99 }} />}
                            <Typography className={classes.name}>{currentPersona?.nickname}</Typography>
                        </Box>
                        <Icons.Connect size={24} />
                        <Box className={classes.info}>
                            <WalletAvatar address={account} size={30} />
                            <Typography className={classes.name}>{walletName}</Typography>
                        </Box>
                    </Box>
                </Box>
            }
            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleCancel}>
                    <Trans>Cancel</Trans>
                </Button>
                {!signResult ?
                    <ActionButton fullWidth onClick={handleSign} disabled={loading || isBound}>
                        <Trans>Sign</Trans>
                    </ActionButton>
                :   <ActionButton fullWidth onClick={handleDone}>
                        <Trans>Done</Trans>
                    </ActionButton>
                }
            </BottomController>
        </Box>
    )
})
