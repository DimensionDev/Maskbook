import { first } from 'lodash-es'
import { useCallback, useState } from 'react'
import { useAsync, useBoolean, useUpdateEffect } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, alpha } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useCurrentPersonaInformation, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { CopyButton, ImageIcon, PersonaAction, WalletDescription } from '@masknet/shared'
import { NetworkPluginID, formatPersonaFingerprint } from '@masknet/shared-base'
import { useRemoteControlledDialog, useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { ActionButton, LoadingBase, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkDescriptor, useProviderDescriptor, useWallets } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, SmartPayOwner, EVMWeb3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { RoutePaths } from '../../constants.js'
import { useDeploy } from '../../hooks/useDeploy.js'
import { useManagers } from '../../hooks/useManagers.js'
import { SmartPayContext } from '../../hooks/useSmartPayContext.js'
import { PluginSmartPayMessages } from '../../message.js'
import { ManagerAccountType, type ManagerAccount } from '../../type.js'
import { CreateSuccessDialog } from './CreateSuccessDialog.js'
import { ManagePopover } from './ManagePopover.js'
import { SmartPayBanner } from './SmartPayBanner.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    walletDescription: {
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 0px 20px rgba(255, 255, 255, 0.12)'
            :   '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
    const navigate = useNavigate()
    const { classes } = useStyles()
    const wallets = useWallets()
    const currentPersona = useCurrentPersonaInformation()
    const [successDialogOpen, toggle] = useBoolean(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [manager, setManager] = useState<ManagerAccount>()

    const { personaManagers, walletManagers } = useManagers()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    const { signer } = SmartPayContext.useContainer()
    const { signWallet, signPersona } = signer || {}
    const providerDescriptor = useProviderDescriptor(NetworkPluginID.PLUGIN_EVM, ProviderType.MaskWallet)
    const polygonDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const currentVisitingProfile = useLastRecognizedIdentity()

    const { value: avatar } = useAsync(async () => {
        if (signPersona) return queryPersonaAvatar(signPersona.identifier)

        return null
    }, [signPersona])

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

    useRenderPhraseCallbackOnDepsChange(() => {
        if (manager) return
        if (personaManagers?.length) {
            const firstPersona = first(personaManagers)

            setManager({
                type: ManagerAccountType.Persona,
                name: firstPersona?.nickname,
                address: firstPersona?.address,
                identifier: firstPersona?.identifier,
            })
        } else if (walletManagers) {
            const firstWallet = first(walletManagers)
            setManager({
                type: ManagerAccountType.Wallet,
                name: firstWallet?.name,
                address: firstWallet?.address,
            })
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
                    <Typography>
                        <Trans>You are in the trial whitelist.</Trans>
                    </Typography>
                    <Typography>
                        <Trans>Create a SmartPay Wallet with your X account.</Trans>
                    </Typography>
                </SmartPayBanner>
                <Box className={classes.walletDescription}>
                    <Box display="flex" alignItems="center" columnGap={1.5}>
                        <Box position="relative" width={30} height={30}>
                            <Icons.SmartPay size={30} />
                            <ImageIcon className={classes.badge} size={12} icon={polygonDescriptor?.icon} />
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between">
                            <Typography lineHeight="18px" fontWeight={700}>
                                SmartPay Wallet
                            </Typography>

                            <Typography className={classes.address}>
                                {queryContractLoading ?
                                    <LoadingBase size={14} />
                                :   <>
                                        {formatEthereumAddress(contractAccount?.address ?? '', 4)}
                                        <CopyButton size={14} text={contractAccount?.address ?? ''} />
                                    </>
                                }
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
                    <Typography className={classes.selectTitle}>
                        <Trans>Set up the Management Account for SmartPay Wallet</Trans>
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Box display="flex" alignItems="center" columnGap={1}>
                            <Icons.MaskBlue size={24} className={classes.maskIcon} />
                            <Typography fontSize={18} fontWeight={700} lineHeight="22px">
                                {manager?.type === 'Persona' ?
                                    formatPersonaFingerprint(manager.identifier?.rawPublicKey ?? '', 4)
                                :   formatEthereumAddress(manager?.address ?? '', 4)}
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
                    <Typography>
                        <Trans>What to know before SmartPay Wallet deployment:</Trans>
                    </Typography>
                    <Box component="ol" pl={1.5}>
                        <Typography component="li">
                            <Trans>
                                User need to deploy the SmartPay Wallet on Polygon Network before using it for
                                blockchain interaction. Wallet that has not been deployed can receive assets, but cannot
                                send any transactions.
                            </Trans>
                        </Typography>
                        <Typography component="li">
                            <Trans>
                                You can change management account of SmartPay Wallet. In Mask Network, both Persona and
                                Mask Wallet can be authorized as management account.
                            </Trans>
                        </Typography>
                        <Typography component="li">
                            <Trans>
                                Users can use SmartPay Wallet (no gas fee and private key change) only on Polygon
                                Network at the moment.
                            </Trans>
                        </Typography>
                        <Typography component="li">
                            <Trans>
                                This SmartPay Wallet can only receive assets on Polygon Network. Please do not use this
                                address to receive assets from other EVM chains.
                            </Trans>
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Box className={classes.stateBar}>
                {signPersona ?
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
                            <Trans>Deploy</Trans>
                        </ActionButton>
                    </PersonaAction>
                :   <Box className={classes.walletStatus}>
                        <WalletDescription
                            pending={false}
                            providerIcon={providerDescriptor?.icon}
                            networkIcon={polygonDescriptor?.icon}
                            iconFilterColor={providerDescriptor?.iconFilterColor}
                            name={signWallet?.name}
                            formattedAddress={
                                signWallet?.address ? formatEthereumAddress(signWallet.address, 4) : undefined
                            }
                            addressLink={
                                signWallet?.address && chainId ?
                                    EVMExplorerResolver.addressLink(chainId, signWallet.address)
                                :   undefined
                            }
                        />
                        <ActionButton
                            onClick={handleDeploy}
                            loading={deployLoading}
                            disabled={deployLoading || queryContractLoading || !signWallet}
                            variant="roundedContained">
                            <Trans>Deploy</Trans>
                        </ActionButton>
                    </Box>
                }
            </Box>
            <CreateSuccessDialog
                open={successDialogOpen}
                onClose={async () => {
                    if (!contractAccount) return
                    await EVMWeb3.addWallet?.(
                        {
                            name: 'Smart pay',
                            address: contractAccount.address,
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
