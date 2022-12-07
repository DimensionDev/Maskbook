import { Icons } from '@masknet/icons'
import { ImageIcon, PersonaAction, useSnackbarCallback, WalletDescription } from '@masknet/shared'
import { formatPersonaFingerprint, NetworkPluginID } from '@masknet/shared-base'
import { ChainId, explorerResolver, formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Typography, alpha, Box } from '@mui/material'

import { useI18N } from '../../locales/index.js'
import { useCallback, useState } from 'react'
import { ManagePopover } from './ManagePopover.js'
import { SmartPayBanner } from './SmartPayBanner.js'
import { ActionButton, LoadingBase, makeStyles } from '@masknet/theme'
import { SmartPayContext } from '../../context/SmartPayContext.js'
import { useContainer } from 'unstated-next'
import { useNetworkDescriptor, useProviderDescriptor } from '@masknet/web3-hooks-base'
import { useAsync, useBoolean, useCopyToClipboard, useUpdateEffect } from 'react-use'
import { SignAccount, SignAccountType } from '../../type.js'
import { SmartPayAccount } from '@masknet/web3-providers'
import { first } from 'lodash-es'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

import { CreateSuccessDialog } from './CreateSuccessDialog.js'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useDepoly } from '../../hooks/useDeploy.js'

const useStyles = makeStyles()((theme) => ({
    walletDescription: {
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px);',
        borderRadius: 12,
        marginTop: theme.spacing(1.5),
        padding: theme.spacing(2),
        display: 'flex',
        justifyContent: 'space-between',
    },
    badge: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
    },
    select: {
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.input,
        borderRadius: 12,
        padding: theme.spacing(1.5),
        marginTop: theme.spacing(1.5),
    },
    selectTitle: {
        color: theme.palette.maskColor.second,
        fontSize: 13,
        lineHeight: '18px',
    },
    maskIcon: {
        filter: 'drop-shadow(0px 6px 12px rgba(0, 65, 185, 0.2))',
        backdropFilter: 'blur(8px)',
    },
    arrow: {
        color: theme.palette.maskColor.second,
    },
    tips: {
        marginTop: theme.spacing(1.5),
        padding: theme.spacing(1.5),
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 12,
    },
    stateBar: {
        position: 'sticky',
        bottom: 0,
        boxShadow: `0px 0px 20px ${alpha(
            theme.palette.maskColor.shadowBottom,
            theme.palette.mode === 'dark' ? 0.12 : 0.05,
        )}`,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    walletStatus: {
        height: 68,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        boxShadow: theme.palette.shadow.popup,
    },
    content: {
        padding: theme.spacing(2),
        minHeight: 484,
        boxSizing: 'border-box',
    },
    bottomFixed: { height: 68, boxSizing: 'border-box' },
}))

export function Deploy({ open }: { open: boolean }) {
    const t = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const [successDialogOpen, toggle] = useBoolean(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [signAccount, setSignAccount] = useState<SignAccount | undefined>()

    const { getPersonaAvatar } = useSNSAdaptorContext()
    const { signablePersonas, signableWallets } = useContainer(SmartPayContext)

    const maskProviderDescriptor = useProviderDescriptor(NetworkPluginID.PLUGIN_EVM, ProviderType.MaskWallet)
    const polygonDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, ChainId.Mumbai)
    const currentVisitingProfile = useLastRecognizedIdentity()

    const { value: avatar } = useAsync(async () => {
        if (signAccount?.type === SignAccountType.Persona && signAccount?.raw?.identifier)
            return getPersonaAvatar(signAccount?.raw?.identifier)

        return null
    }, [signAccount, getPersonaAvatar])

    // #region get contract account
    const { value: contractAccount, loading: queryContractLoading } = useAsync(async () => {
        if (!signAccount?.identity || !signAccount?.address || !open) return

        const accounts = await SmartPayAccount.getAccounts(ChainId.Mumbai, [signAccount?.address])

        return first(accounts)
    }, [signAccount, open])
    // #endregion

    // #region copy event handler
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(contractAccount?.address ?? ''),
        deps: [],
        successText: t.copy_wallet_address_success(),
    })
    // #endregion

    const [{ loading: deployLoading }, handleDeploy] = useDepoly(signAccount, contractAccount)

    const handleSelectSignAccount = useCallback((signAccount: SignAccount) => {
        setSignAccount(signAccount)
    }, [])

    useUpdateEffect(() => {
        if (signablePersonas?.length) {
            const firstPersona = first(signablePersonas)

            setSignAccount({
                type: SignAccountType.Persona,
                identity: firstPersona?.identifier.publicKeyAsHex,
                name: firstPersona?.nickname,
                address: firstPersona?.address,
                raw: firstPersona,
            })

            return
        } else if (signableWallets) {
            const firstWallet = first(signableWallets)
            setSignAccount({
                type: SignAccountType.Wallet,
                identity: firstWallet?.address,
                name: firstWallet?.name,
                address: firstWallet?.address,
            })
            return
        }
    }, [signablePersonas, signableWallets])

    return (
        <>
            <Box className={classes.content}>
                <SmartPayBanner>
                    {t.personas_description({
                        personas:
                            signablePersonas
                                ?.map((persona) => formatPersonaFingerprint(persona.identifier.rawPublicKey, 4))
                                .join(',') ?? '',
                    })}
                </SmartPayBanner>
                <Box className={classes.walletDescription}>
                    <Box display="flex" alignItems="center" columnGap={1.5}>
                        <Box position="relative" width={30} height={30}>
                            <Icons.SmartPay size={30} />
                            <ImageIcon classes={{ icon: classes.badge }} size={12} icon={polygonDescriptor?.icon} />
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between">
                            <Typography lineHeight="18px" fontWeight={700}>
                                Smart Pay 1
                            </Typography>

                            <Typography className={classes.address}>
                                {queryContractLoading ? (
                                    <LoadingBase size={14} />
                                ) : (
                                    <>
                                        {formatEthereumAddress(contractAccount?.address ?? '', 4)}
                                        <Icons.PopupCopy onClick={onCopy} size={14} />
                                    </>
                                )}
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" alignItems="flex-end" columnGap={0.5}>
                        <Typography lineHeight="18px" fontWeight={700}>
                            $
                        </Typography>
                        <Typography fontSize={24} fontWeight={700} lineHeight="1.2">
                            0.00
                        </Typography>
                    </Box>
                </Box>
                <Box
                    className={classes.select}
                    onMouseDown={(event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        setAnchorEl(event.currentTarget)
                    }}>
                    <Typography className={classes.selectTitle}>{t.setup_smart_pay_managed_account()}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Box display="flex" alignItems="center" columnGap={1}>
                            <Icons.MaskBlue size={24} className={classes.maskIcon} />
                            <Typography fontSize={18} fontWeight={700} lineHeight="22px">
                                {signAccount?.type === 'Persona'
                                    ? formatPersonaFingerprint(signAccount.identity ?? '', 4)
                                    : formatEthereumAddress(signAccount?.identity ?? '', 4)}
                            </Typography>
                        </Box>
                        <Icons.ArrowDrop className={classes.arrow} size={24} />
                    </Box>
                    <ManagePopover
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={() => {
                            setAnchorEl(null)
                        }}
                        signablePersonas={signablePersonas ?? []}
                        signableWallets={signableWallets ?? []}
                        selectedIdentity={signAccount?.identity}
                        onSelect={handleSelectSignAccount}
                    />
                </Box>
                <Box className={classes.tips}>
                    <Typography>{t.deploy_tips_title()}</Typography>
                    <Box component="ol" pl={1.5}>
                        <Typography component="li">{t.deploy_tips_description_one()}</Typography>
                        <Typography component="li">{t.deploy_tips_description_two()}</Typography>
                        <Typography component="li">{t.deploy_tips_description_three()}</Typography>
                        <Typography component="li">{t.deploy_tips_description_four()}</Typography>
                    </Box>
                </Box>
            </Box>
            <Box className={classes.stateBar}>
                {signAccount?.type === SignAccountType.Persona ? (
                    <PersonaAction
                        classes={{ bottomFixed: classes.bottomFixed }}
                        avatar={avatar !== null ? avatar : undefined}
                        currentPersona={signAccount?.raw}
                        currentVisitingProfile={currentVisitingProfile}>
                        <ActionButton
                            onClick={handleDeploy}
                            loading={deployLoading}
                            disabled={deployLoading || queryContractLoading || !signAccount}
                            variant="roundedOutlined">
                            {t.deploy()}
                        </ActionButton>
                    </PersonaAction>
                ) : (
                    <Box className={classes.walletStatus}>
                        <WalletDescription
                            pending={false}
                            providerIcon={maskProviderDescriptor?.icon}
                            networkIcon={polygonDescriptor?.icon}
                            iconFilterColor={maskProviderDescriptor?.iconFilterColor}
                            name={signAccount?.name}
                            formattedAddress={
                                signAccount?.identity ? formatEthereumAddress(signAccount?.identity, 4) : undefined
                            }
                            addressLink={
                                signAccount?.identity
                                    ? explorerResolver.addressLink(ChainId.Mumbai, signAccount?.identity)
                                    : undefined
                            }
                        />
                        <ActionButton
                            onClick={handleDeploy}
                            loading={deployLoading}
                            disabled={deployLoading || queryContractLoading || !signAccount}
                            variant="roundedOutlined">
                            {t.deploy()}
                        </ActionButton>
                    </Box>
                )}
            </Box>
            <CreateSuccessDialog
                open={successDialogOpen}
                onClose={() => {
                    toggle()
                    navigate(RoutePaths.Main)
                }}
                address={contractAccount?.address ?? ''}
                owner={`${signAccount?.type === 'Persona' ? 'Persona' : 'Mask Wallet'} ${signAccount?.name}`}
            />
        </>
    )
}
