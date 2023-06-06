import { useCallback, useEffect, useState } from 'react'
import { useAsync, useBoolean, useCopyToClipboard, useUpdateEffect } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { first } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { ImageIcon, PersonaAction, useSnackbarCallback, WalletDescription } from '@masknet/shared'
import { formatPersonaFingerprint, NetworkPluginID } from '@masknet/shared-base'
import { explorerResolver, formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Typography, alpha, Box } from '@mui/material'
import { useChainContext, useNetworkDescriptor, useProviderDescriptor, useWallets } from '@masknet/web3-hooks-base'
import { SmartPayOwner, Web3 } from '@masknet/web3-providers'
import {
    useCurrentPersonaInformation,
    useLastRecognizedIdentity,
    useSNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'
import { ActionButton, LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ManagePopover } from './ManagePopover.js'
import { SmartPayBanner } from './SmartPayBanner.js'
import { type ManagerAccount, ManagerAccountType } from '../../type.js'
import { useI18N } from '../../locales/index.js'
import { CreateSuccessDialog } from './CreateSuccessDialog.js'
import { RoutePaths } from '../../constants.js'
import { useDeploy } from '../../hooks/useDeploy.js'
import { useManagers } from '../../hooks/useManagers.js'
import { SmartPayContext } from '../../hooks/useSmartPayContext.js'
import { PluginSmartPayMessages } from '../../message.js'

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
        maxHeight: 200,
        boxSizing: 'border-box',
        overflowY: 'scroll',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
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
        minHeight: 564,
        boxSizing: 'border-box',
    },
    bottomFixed: { height: 68, boxSizing: 'border-box' },
}))

export function Deploy({ open }: { open: boolean }) {
    const t = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const wallets = useWallets()
    const currentPersona = useCurrentPersonaInformation()
    const [successDialogOpen, toggle] = useBoolean(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [manager, setManager] = useState<ManagerAccount | undefined>()

    const { getPersonaAvatar } = useSNSAdaptorContext()
    const { personaManagers, walletManagers } = useManagers()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    const { signer } = SmartPayContext.useContainer()
    const { signWallet, signPersona } = signer || {}
    const maskProviderDescriptor = useProviderDescriptor(NetworkPluginID.PLUGIN_EVM, ProviderType.MaskWallet)
    const polygonDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const currentVisitingProfile = useLastRecognizedIdentity()

    const { value: avatar } = useAsync(async () => {
        if (signPersona) return getPersonaAvatar(signPersona.identifier)

        return null
    }, [signPersona, getPersonaAvatar])

    // #region get contract account
    const { value, loading: queryContractLoading } = useAsync(async () => {
        if (!manager?.address || !open || !chainId) return

        const accounts = await SmartPayOwner.getAccountsByOwner(chainId, manager.address, false)
        const nonce = accounts.filter((x) => x.deployed && isSameAddress(manager.address, x.creator)).length

        return {
            account: accounts[nonce],
            nonce,
        }
    }, [manager, open, chainId])
    // #endregion

    const { account: contractAccount, nonce } = value ?? {}

    // #region copy event handler
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(contractAccount?.address ?? ''),
        deps: [],
        successText: t.copy_wallet_address_success(),
    })
    // #endregion

    const [{ loading: deployLoading }, handleDeploy] = useDeploy(
        signPersona,
        signWallet,
        manager,
        contractAccount,
        nonce,
        toggle,
    )

    const handleSelectManager = useCallback((manager: ManagerAccount) => {
        setManager(manager)
        setAnchorEl(null)
    }, [])

    useEffect(() => {
        if (manager) return
        if (personaManagers.length) {
            const firstPersona = first(personaManagers)

            setManager({
                type: ManagerAccountType.Persona,
                name: firstPersona?.nickname,
                address: firstPersona?.address,
                identifier: firstPersona?.identifier,
            })

            return
        } else if (walletManagers) {
            const firstWallet = first(walletManagers)
            setManager({
                type: ManagerAccountType.Wallet,
                name: firstWallet?.name,
                address: firstWallet?.address,
            })
            return
        }
    }, [personaManagers, walletManagers, manager])

    useUpdateEffect(() => {
        if (
            (signer?.signPersona &&
                currentPersona?.identifier.publicKeyAsHex !== signer.signPersona.identifier.publicKeyAsHex) ||
            (signer?.signWallet && !wallets.some((x) => isSameAddress(x.address, signer.signWallet?.address)))
        ) {
            closeDialog()
        }
    }, [currentPersona, signer, wallets])

    return (
        <>
            <Box className={classes.content}>
                <SmartPayBanner>
                    <Typography>{t.white_list_tips()}</Typography>
                    <Typography>{t.personas_description()}</Typography>
                </SmartPayBanner>
                <Box className={classes.walletDescription}>
                    <Box display="flex" alignItems="center" columnGap={1.5}>
                        <Box position="relative" width={30} height={30}>
                            <Icons.SmartPay size={30} />
                            <ImageIcon classes={{ icon: classes.badge }} size={12} icon={polygonDescriptor?.icon} />
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between">
                            <Typography lineHeight="18px" fontWeight={700}>
                                SmartPay Wallet
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
                                {manager?.type === 'Persona'
                                    ? formatPersonaFingerprint(manager.identifier?.rawPublicKey ?? '', 4)
                                    : formatEthereumAddress(manager?.address ?? '', 4)}
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
                        selectedAddress={manager?.address}
                        onSelect={handleSelectManager}
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
                {signPersona ? (
                    <PersonaAction
                        classes={{ bottomFixed: classes.bottomFixed }}
                        avatar={avatar !== null ? avatar : undefined}
                        currentPersona={signPersona}
                        currentVisitingProfile={currentVisitingProfile}>
                        <ActionButton
                            onClick={handleDeploy}
                            loading={deployLoading}
                            disabled={deployLoading || queryContractLoading || !signPersona}
                            variant="roundedContained">
                            {t.deploy()}
                        </ActionButton>
                    </PersonaAction>
                ) : (
                    <Box className={classes.walletStatus}>
                        <WalletDescription
                            pending={false}
                            providerIcon={maskProviderDescriptor.icon}
                            networkIcon={polygonDescriptor?.icon}
                            iconFilterColor={maskProviderDescriptor.iconFilterColor}
                            name={signWallet?.name}
                            formattedAddress={
                                signWallet?.address ? formatEthereumAddress(signWallet.address, 4) : undefined
                            }
                            addressLink={
                                signWallet?.address && chainId
                                    ? explorerResolver.addressLink(chainId, signWallet.address)
                                    : undefined
                            }
                        />
                        <ActionButton
                            onClick={handleDeploy}
                            loading={deployLoading}
                            disabled={deployLoading || queryContractLoading || !signWallet}
                            variant="roundedContained">
                            {t.deploy()}
                        </ActionButton>
                    </Box>
                )}
            </Box>
            <CreateSuccessDialog
                open={successDialogOpen}
                onClose={async () => {
                    if (!contractAccount) return
                    await Web3.addWallet?.(
                        {
                            name: 'Smart pay',
                            owner: manager?.address,
                            address: contractAccount.address,
                            identifier: manager?.identifier?.toText(),
                            hasDerivationPath: false,
                            hasStoredKeyInfo: false,
                            id: contractAccount.address,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        {
                            providerType: ProviderType.MaskWallet,
                            account: '',
                            chainId,
                        },
                    )
                    toggle()
                    navigate(RoutePaths.Main)
                }}
                address={contractAccount?.address ?? ''}
                owner={`${manager?.type === 'Persona' ? 'Persona' : 'Mask Wallet'} ${manager?.name}`}
            />
        </>
    )
}
