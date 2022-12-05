import { Icons } from '@masknet/icons'
import {
    useCurrentPersonaInformation,
    useLastRecognizedIdentity,
    useSNSAdaptorContext,
} from '@masknet/plugin-infra/content-script'
import { ImageIcon, InjectedDialog, PersonaAction, useSnackbarCallback } from '@masknet/shared'
import { formatPersonaFingerprint, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkDescriptor, useWeb3Connection } from '@masknet/web3-hooks-base'
import { SmartPayAccount, SmartPayFunder } from '@masknet/web3-providers'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { DialogActions, DialogContent, Link, Typography, Box } from '@mui/material'
import getUnixTime from 'date-fns/getUnixTime'
import { first } from 'lodash-es'
import { memo, useCallback, useState } from 'react'
import { useAsync, useAsyncFn, useCopyToClipboard, useUpdateEffect } from 'react-use'
import { useSignableAccounts } from '../../hooks/useSignableAccounts.js'
import { Translate, useI18N } from '../../locales/index.js'
import { PluginSmartPayMessages } from '../../message.js'
import { SignAccount, SignAccountType } from '../../type.js'
import { ManagePopover } from './ManagePopover.js'
import { SmartPayBanner } from './SmartPayBanner.js'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: theme.spacing(2),
        minHeight: 484,
        boxSizing: 'border-box',
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
    dialogActions: {
        padding: '0px !important',
    },
    description: {
        marginTop: theme.spacing(1.5),
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        '& > a': {
            color: theme.palette.maskColor.highlight,
        },
    },
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
}))

export const SmartPayDeployDialog = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const [inWhiteList, setInWhiteList] = useState(true)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [signAccount, setSignAccount] = useState<SignAccount | undefined>()
    const { open, closeDialog } = useRemoteControlledDialog(
        PluginSmartPayMessages.smartPayDeployDialogEvent,
        (event) => {
            if (!event.open) return
            setInWhiteList(event.inWhiteList)
        },
    )

    const { personaSignPayMessage, getPersonaAvatar } = useSNSAdaptorContext()
    const connection = useWeb3Connection()
    const { account, providerType } = useChainContext()
    const { setDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDescriptionDialogEvent)

    const polygonDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, ChainId.Mumbai)

    const { value } = useSignableAccounts()

    const { signablePersonas, signableWallets } = value ?? {}

    // #region get current persona information
    const currentPersona = useCurrentPersonaInformation()
    const currentVisitingProfile = useLastRecognizedIdentity()
    const { value: avatar } = useAsync(
        async () => getPersonaAvatar(currentPersona?.identifier),
        [currentPersona, getPersonaAvatar],
    )
    // #endregion

    // #region select signal account
    useUpdateEffect(() => {
        if (signablePersonas?.length) {
            const firstPersona = first(signablePersonas)

            setSignAccount({
                type: SignAccountType.Persona,
                identity: firstPersona?.identifier.publicKeyAsHex,
                name: firstPersona?.nickname,
                address: firstPersona?.address,
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

    const handleSelectSignAccount = useCallback((signAccount: SignAccount) => {
        setSignAccount(signAccount)
    }, [])
    // #endregion

    const { value: contractAccount, error } = useAsync(async () => {
        if (!signAccount?.identity || !signAccount?.address || !open) return

        const accounts = await SmartPayAccount.getAccounts(ChainId.Mumbai, [signAccount?.address])

        return first(accounts)
    }, [signAccount, open])

    const [{ loading }, handleDeploy] = useAsyncFn(async () => {
        if (!currentVisitingProfile?.identifier?.userId || !currentPersona || !signAccount?.address) return

        const payload = JSON.stringify({
            twitterHandler: currentVisitingProfile.identifier.userId,
            ts: getUnixTime(new Date()),
            publicKey: currentPersona?.identifier.publicKeyAsHex,
            nonce: 0,
        })

        const signature = await personaSignPayMessage({
            message: payload,
            identifier: currentPersona.identifier,
        })

        const response = await SmartPayFunder.fund(ChainId.Mumbai, {
            ownerAddress: signAccount.address,
            signature,
            payload,
        })

        // TODO: wallet sign account
    }, [connection, signAccount, account, providerType, currentVisitingProfile?.identifier, currentPersona])

    // #region copy event handler
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(contractAccount?.address ?? ''),
        deps: [],
        successText: t.copy_wallet_address_success(),
    })
    // #endregion

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t.smart_pay_wallet()}
            titleTail={<Icons.Questions onClick={() => setDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                {inWhiteList ? (
                    <>
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
                                    <ImageIcon
                                        classes={{ icon: classes.badge }}
                                        size={12}
                                        icon={polygonDescriptor?.icon}
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column" justifyContent="space-between">
                                    <Typography lineHeight="18px" fontWeight={700}>
                                        Smart Pay 1
                                    </Typography>
                                    <Typography className={classes.address}>
                                        {formatEthereumAddress(contractAccount?.address ?? '', 4)}
                                        <Icons.PopupCopy onClick={onCopy} size={14} />
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
                                {t.setup_smart_pay_managed_account()}
                            </Typography>
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
                    </>
                ) : (
                    <>
                        <SmartPayBanner>{t.ineligibility_tips()}</SmartPayBanner>
                        <Typography className={classes.description}>
                            <Translate.eligibility_description
                                components={{
                                    Link: (
                                        <Link
                                            href="https://twitter.com/realMaskNetwork"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        />
                                    ),
                                    Discord: (
                                        <Link
                                            href="https://discord.com/invite/4SVXvj7"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        />
                                    ),
                                }}
                            />
                        </Typography>
                        <Typography className={classes.description}>
                            <Translate.eligibility_query
                                components={{
                                    Link: (
                                        <Link
                                            href="https://twitter.com/realMaskNetwork"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        />
                                    ),
                                }}
                            />
                        </Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <PersonaAction
                    avatar={avatar !== null ? avatar : undefined}
                    currentPersona={currentPersona}
                    currentVisitingProfile={currentVisitingProfile}>
                    {inWhiteList ? (
                        <ActionButton onClick={handleDeploy} loading={loading} variant="roundedOutlined">
                            {t.deploy()}
                        </ActionButton>
                    ) : null}
                </PersonaAction>
            </DialogActions>
        </InjectedDialog>
    )
})
