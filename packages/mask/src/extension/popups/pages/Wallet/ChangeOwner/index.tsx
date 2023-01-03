import { Icons } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { formatPersonaFingerprint, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useWallets, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { explorerResolver, formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Link, Popover, Typography, Button } from '@mui/material'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import { useContainer } from 'unstated-next'
import { useI18N } from '../../../../../utils/index.js'
import Services from '../../../../service.js'
import { CopyIconButton } from '../../../components/CopyIconButton/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { StyledRadio } from '../../../components/StyledRadio/index.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { useTitle } from '../../../hook/useTitle.js'

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
    },
    placeholder: {
        padding: theme.spacing(3.5, 1),
    },
    list: {
        padding: theme.spacing(2, 0),
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
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
    rawPublicKey?: string
}

export default function ChangeOwner() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [manageAccount, setManageAccount] = useState<ManagerAccount | undefined>()

    const { smartPayChainId } = useContainer(PopupContext)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets()

    const contractAccount = useMemo(() => {
        const address = new URLSearchParams(location.search).get('address')
        if (!address) return
        return wallets.find((x) => isSameAddress(x.address, address))
    }, [location, wallets])

    const ownerAddress = new URLSearchParams(location.search).get('owner')

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: personaManagers } = useAsync(async () => {
        return Services.Identity.queryOwnedPersonaInformation(false)
    }, [])

    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    const [, handleConfirm] = useAsyncFn(async () => {
        if (!manageAccount?.address || !ownerAddress) return
        return connection?.changeOwner?.(manageAccount.address, {
            chainId: smartPayChainId,
            account: contractAccount?.address,
            providerType: ProviderType.MaskWallet,
        })
    }, [manageAccount?.address, smartPayChainId, contractAccount])

    useTitle(t('popups_wallet_change_owner'))

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
                                sx={{ display: 'flex', alignItems: 'center' }}
                                href={explorerResolver.addressLink(chainId, contractAccount?.address ?? '')}
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
                    <Typography className={classes.popoverTitle}>{t('persona')}</Typography>
                    {personaManagers?.length ? (
                        <Box className={classes.list}>
                            {personaManagers.map((persona, index) => (
                                <Box
                                    key={index}
                                    className={cx(
                                        classes.item,
                                        isSameAddress(persona.address, ownerAddress ?? '')
                                            ? classes.disabledItem
                                            : undefined,
                                    )}
                                    onClick={() =>
                                        setManageAccount({
                                            type: ManagerAccountType.Persona,
                                            name: persona.nickname,
                                            address: persona.address,
                                            rawPublicKey: persona.identifier.rawPublicKey,
                                        })
                                    }>
                                    <Box display="flex" alignItems="center" columnGap={0.5}>
                                        <Icons.MaskBlue size={30} />
                                        <Box>
                                            <Typography className={classes.popoverTitle}>{persona.nickname}</Typography>
                                            <Typography className={classes.identity}>
                                                {formatPersonaFingerprint(persona.identifier.rawPublicKey, 4)}
                                                <CopyIconButton
                                                    text={persona.identifier.rawPublicKey}
                                                    className={classes.copy}
                                                />
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <StyledRadio checked={isSameAddress(persona.address, manageAccount?.address)} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box className={classes.placeholder}>
                            <Typography>{t('popups_wallet_no_encrypted_placeholder')}</Typography>
                        </Box>
                    )}
                    <Typography className={classes.popoverTitle}>{t('popups_wallet_wallets')}</Typography>
                    {walletManagers?.length ? (
                        <Box className={classes.list}>
                            {walletManagers?.map((wallet, index) => (
                                <Box
                                    key={index}
                                    className={cx(
                                        classes.item,
                                        isSameAddress(wallet.address, ownerAddress ?? '')
                                            ? classes.disabledItem
                                            : undefined,
                                    )}
                                    onClick={() =>
                                        setManageAccount({
                                            type: ManagerAccountType.Wallet,
                                            name: wallet.name,
                                            address: wallet.address,
                                        })
                                    }>
                                    <Box display="flex" alignItems="center" columnGap={0.5}>
                                        <Icons.MaskBlue size={30} />
                                        <Box>
                                            <Typography className={classes.popoverTitle}>{wallet.name}</Typography>
                                            <Typography className={classes.identity}>
                                                {formatEthereumAddress(wallet.address, 4)}

                                                <CopyIconButton text={wallet.address} className={classes.copy} />
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <StyledRadio checked={isSameAddress(manageAccount?.address, wallet.address)} />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box className={classes.placeholder}>
                            <Typography>{t('popups_wallet_no_encrypted_placeholder')}</Typography>
                        </Box>
                    )}
                </Popover>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={cx(classes.button, classes.secondaryButton)}
                    onClick={() => {
                        navigate(-1)
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
