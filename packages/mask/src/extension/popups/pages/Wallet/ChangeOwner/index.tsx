import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import { useContainer } from 'unstated-next'
import { Box, Link, Popover, Typography, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CopyButton, FormattedAddress } from '@masknet/shared'
import {
    DashboardRoutes,
    ECKeyIdentifier,
    formatPersonaFingerprint,
    type NetworkPluginID,
    PopupModalRoutes,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { ExplorerResolver, Web3 } from '@masknet/web3-providers'
import { useI18N } from '../../../../../utils/index.js'
import Services from '../../../../service.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { StyledRadio } from '../../../components/StyledRadio/index.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { useTitle } from '../../../hook/useTitle.js'
import { WalletContext } from '../hooks/useWalletContext.js'
import { useModalNavigate } from '../../../components/index.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2),
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    wallet: {
        padding: theme.spacing(1.25),
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
    },
    text: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
        fontWeight: 600,
        display: 'flex',
    },
    icon: {
        fontSize: 12,
        height: 12,
        width: 12,
        color: '#1C68F3',
        cursor: 'pointer',
        marginLeft: 4,
    },
    paper: {
        padding: theme.spacing(1.5),
        borderRadius: 16,
    },
    popoverTitle: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        display: 'flex',
        justifyContent: 'space-between',
    },
    add: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    placeholder: {
        padding: theme.spacing(3.5, 1),
        color: theme.palette.maskColor.second,
    },
    list: {
        padding: theme.spacing(2, 0),
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        cursor: 'pointer',
    },
    identity: {
        fontSIze: 14,
        lineHeight: '18px',
        color: '#767F8D',
        display: 'flex',
        alignItems: 'center',
    },
    copy: {
        fontSize: 14,
        width: 14,
        height: 14,
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    secondaryButton: {
        backgroundColor: '#F7F9FA',
        color: '#1C68F3',
        '&:hover': {
            backgroundColor: 'rgba(28, 104, 243, 0.04)',
        },
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    disabledItem: {
        opacity: 0.5,
    },
}))

enum ManagerAccountType {
    Wallet = 'Wallet',
    Persona = 'Persona',
}

interface ManagerAccount {
    type: ManagerAccountType
    name?: string
    address?: string
    identifier?: ECKeyIdentifier
}

export default function ChangeOwner() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [manageAccount, setManageAccount] = useState<ManagerAccount>()

    const { smartPayChainId } = useContainer(PopupContext)
    const wallet = useWallet()
    const wallets = useWallets()

    const { selectedWallet: contractAccount } = useContainer(WalletContext)

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: personaManagers } = useAsync(async () => {
        return Services.Identity.queryOwnedPersonaInformation(true)
    }, [])

    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    const [, handleConfirm] = useAsyncFn(async () => {
        if (!manageAccount?.address || !contractAccount) return
        if (!isSameAddress(wallet?.address, contractAccount.address))
            await Web3.connect({
                account: contractAccount?.address,
                chainId: smartPayChainId,
                providerType: ProviderType.MaskWallet,
            })
        const hash = await Web3.changeOwner?.(manageAccount.address, {
            chainId: smartPayChainId,
            account: contractAccount?.address,
            providerType: ProviderType.MaskWallet,
            owner: contractAccount?.owner,
            identifier: ECKeyIdentifier.from(contractAccount?.identifier).unwrapOr(undefined),
        })

        if (!hash) return

        const receipt = await Web3.confirmTransaction(hash, {
            signal: AbortSignal.timeout(5 * 60 * 1000),
        })

        if (!receipt.status) return

        await Web3.updateWallet?.(
            contractAccount.address,
            {
                owner: manageAccount.address,
                identifier: manageAccount.identifier?.toText(),
            },
            { providerType: ProviderType.MaskWallet },
        )
    }, [manageAccount?.address, smartPayChainId, contractAccount, wallet])

    useTitle(t('popups_wallet_change_owner'))

    const onCreatePersona = useCallback(async () => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${DashboardRoutes.SignUp}`),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        await Services.Helper.removePopupWindow()
    }, [])

    const modalNavigate = useModalNavigate()
    const onCreateWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.SwitchWallet)
    }, [modalNavigate])

    return (
        <>
            <div className={classes.content}>
                <Typography className={classes.title}>{t('popups_wallet_current_managed_accounts')}</Typography>
                <Box className={classes.wallet}>
                    <Icons.MaskWallet />
                    <Box>
                        <Typography className={classes.text}>{contractAccount?.name}</Typography>
                        <Typography className={classes.text}>
                            <FormattedAddress
                                address={contractAccount?.address}
                                size={4}
                                formatter={formatEthereumAddress}
                            />
                            <Link
                                display="flex"
                                alignItems="center"
                                href={
                                    contractAccount?.address
                                        ? ExplorerResolver.addressLink(chainId, contractAccount.address)
                                        : undefined
                                }
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.PopupLink className={classes.icon} />
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                <Typography className={classes.title} sx={{ mb: 1.25 }}>
                    {t('popups_wallet_set_a_new_manage_account')}
                </Typography>
                <StyledInput
                    placeholder="Select"
                    InputProps={{ endAdornment: <Icons.ArrowDrop size={20} /> }}
                    value={manageAccount?.name}
                    onMouseDown={(event) => {
                        setAnchorEl(event.currentTarget)
                    }}
                    inputProps={{ style: { cursor: 'pointer' } }}
                />
                <Popover
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    onClose={() => {
                        setAnchorEl(null)
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    PaperProps={{ style: { minWidth: `${anchorEl?.clientWidth ?? 568}px` }, className: classes.paper }}
                    disableRestoreFocus>
                    <Typography className={classes.popoverTitle}>
                        {t('persona')}{' '}
                        <Typography className={classes.add} onClick={onCreatePersona}>
                            {t('add')}
                        </Typography>
                    </Typography>
                    {personaManagers?.length ? (
                        <Box className={classes.list}>
                            {personaManagers.map((persona, index) => (
                                <Box
                                    key={index}
                                    className={cx(
                                        classes.item,
                                        isSameAddress(persona.address, contractAccount?.owner)
                                            ? classes.disabledItem
                                            : undefined,
                                    )}
                                    onClick={() => {
                                        if (isSameAddress(persona.address, contractAccount?.owner)) return
                                        setManageAccount({
                                            type: ManagerAccountType.Persona,
                                            name: persona.nickname,
                                            address: persona.address,
                                            identifier: persona.identifier,
                                        })
                                    }}>
                                    <Box display="flex" alignItems="center" columnGap={0.5}>
                                        <Icons.MaskBlue size={30} />
                                        <Box>
                                            <Typography className={classes.popoverTitle}>{persona.nickname}</Typography>
                                            <Typography className={classes.identity}>
                                                {formatPersonaFingerprint(persona.identifier.rawPublicKey, 4)}
                                                <CopyButton
                                                    text={persona.identifier.rawPublicKey}
                                                    className={classes.copy}
                                                    size={14}
                                                />
                                                {persona.address ? (
                                                    <Link
                                                        sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}
                                                        href={ExplorerResolver.addressLink(chainId, persona.address)}
                                                        target="_blank"
                                                        rel="noopener noreferrer">
                                                        <Icons.PopupLink className={classes.copy} />
                                                    </Link>
                                                ) : null}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <StyledRadio checked={isSameAddress(persona.address, manageAccount?.address)} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box className={classes.placeholder}>
                            <Typography>{t('popups_no_persona_found')}</Typography>
                        </Box>
                    )}
                    <Typography className={classes.popoverTitle}>
                        {t('popups_wallet_wallets')}
                        <Typography className={classes.add} onClick={onCreateWallet}>
                            {t('add')}
                        </Typography>
                    </Typography>
                    {walletManagers?.length ? (
                        <Box className={classes.list}>
                            {walletManagers?.map((wallet, index) => (
                                <Box
                                    key={index}
                                    className={cx(
                                        classes.item,
                                        isSameAddress(wallet.address, contractAccount?.owner)
                                            ? classes.disabledItem
                                            : undefined,
                                    )}
                                    onClick={() => {
                                        if (isSameAddress(wallet.address, contractAccount?.owner)) return
                                        setManageAccount({
                                            type: ManagerAccountType.Wallet,
                                            name: wallet.name,
                                            address: wallet.address,
                                        })
                                    }}>
                                    <Box display="flex" alignItems="center" columnGap={0.5}>
                                        <Icons.MaskBlue size={30} />
                                        <Box>
                                            <Typography className={classes.popoverTitle}>{wallet.name}</Typography>
                                            <Typography className={classes.identity}>
                                                {formatEthereumAddress(wallet.address, 4)}
                                                <CopyButton text={wallet.address} className={classes.copy} size={14} />
                                                <Link
                                                    sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}
                                                    href={ExplorerResolver.addressLink(chainId, wallet.address)}
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    <Icons.PopupLink className={classes.copy} />
                                                </Link>
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <StyledRadio checked={isSameAddress(manageAccount?.address, wallet.address)} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box className={classes.placeholder}>
                            <Typography>{t('popups_no_wallets_found')}</Typography>
                        </Box>
                    )}
                </Popover>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={cx(classes.button, classes.secondaryButton)}
                    onClick={() => {
                        const toBeClose = new URLSearchParams(location.search).get('toBeClose')
                        if (toBeClose) {
                            Services.Helper.removePopupWindow()
                        } else {
                            navigate(-1)
                        }
                    }}>
                    {t('cancel')}
                </Button>
                <Button variant="contained" className={classes.button} onClick={handleConfirm}>
                    {t('confirm')}
                </Button>
            </div>
        </>
    )
}
