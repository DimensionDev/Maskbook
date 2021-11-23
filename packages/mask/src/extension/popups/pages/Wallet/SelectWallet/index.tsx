import { memo, useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { first } from 'lodash-unified'
import { MaskWalletIcon, SuccessIcon } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    getNetworkName,
    isSameAddress,
    ProviderType,
    useAccount,
    useChainIdValid,
    useWallets,
    formatEthereumAddress,
} from '@masknet/web3-shared-evm'
import { Button, List, ListItem, ListItemText, Typography } from '@mui/material'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { CopyIconButton } from '../../../components/CopyIconButton'
import { currentProviderSettings } from '../../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../../utils'
import Services from '../../../../service'

const useStyles = makeStyles()({
    content: {
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 10,
        display: 'flex',
        marginBottom: 1,
        backgroundColor: '#ffffff',
    },
    network: {
        minWidth: 114,
        padding: '4px 12px 4px 4px',
        minHeight: 28,
        borderRadius: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1c68f3',
    },
    title: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: '16px',
    },
    iconWrapper: {
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
        height: 'calc(100vh - 168px)',
        overflow: 'auto',
    },
    item: {
        padding: 10,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    address: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
    },
    copy: {
        fontSize: 12,
        stroke: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
    name: {
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    text: {
        marginLeft: 4,
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
})

const SelectWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const wallet = useAccount()
    const wallets = useWallets(ProviderType.MaskWallet)

    const [selected, setSelected] = useState(wallet)

    const search = new URLSearchParams(location.search)

    const chainIdSearched = search.get('chainId')
    const chainId = chainIdSearched ? (Number.parseInt(chainIdSearched, 10) as ChainId) : undefined
    // Swap page also uses SelectWallet, but changing wallet in Swap page
    // should not affect other pages, for example, dashboard.
    // So we make Swap page 'internal' for popups
    const isInternal = search.get('internal')

    const chainIdValid = useChainIdValid()

    const handleCancel = useCallback(async () => {
        await WalletRPC.selectAccount([], ChainId.Mainnet)
        await Services.Helper.removePopupWindow()
    }, [])

    const handleConfirm = useCallback(async () => {
        await WalletRPC.updateMaskAccount({
            chainId,
            account: selected,
        })
        if (currentProviderSettings.value === ProviderType.MaskWallet || !isInternal) {
            await WalletRPC.updateAccount({
                chainId,
                account: selected,
                providerType: ProviderType.MaskWallet,
            })
        }
        if (chainId) {
            await WalletRPC.selectAccount([selected], chainId)
        }
        return Services.Helper.removePopupWindow()
    }, [chainId, selected, isInternal])

    useEffect(() => {
        if (!selected && wallets.length) setSelected(first(wallets)?.address ?? '')
    }, [selected, wallets])

    return chainId && chainIdValid ? (
        <>
            <div className={classes.content}>
                <div className={classes.header}>
                    <div className={classes.network}>
                        <div className={classes.iconWrapper}>{/* <ChainIcon chainId={chainId} /> */}</div>
                        <Typography className={classes.title}>{getNetworkName(chainId)}</Typography>
                    </div>
                </div>
                <List dense className={classes.list}>
                    {wallets.map((item, index) => (
                        <ListItem className={classes.item} key={index} onClick={() => setSelected(item.address)}>
                            <MaskWalletIcon />
                            <ListItemText className={classes.text}>
                                <div className={classes.listItem}>
                                    <div>
                                        <Typography className={classes.name}>{item.name}</Typography>
                                        <Typography className={classes.address}>
                                            <FormattedAddress
                                                address={item.address}
                                                size={12}
                                                formatter={formatEthereumAddress}
                                            />
                                            <CopyIconButton className={classes.copy} text={item.address} />
                                        </Typography>
                                    </div>
                                    {isSameAddress(item.address, selected) ? <SuccessIcon /> : null}
                                </div>
                            </ListItemText>
                        </ListItem>
                    ))}
                </List>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                    onClick={handleCancel}>
                    {t('cancel')}
                </Button>
                <Button variant="contained" disabled={!selected} className={classes.button} onClick={handleConfirm}>
                    {t('confirm')}
                </Button>
            </div>
        </>
    ) : (
        <div className={classes.placeholder}>
            <Typography>{t('popups_wallet_unsupported_network')}</Typography>
        </div>
    )
})

export default SelectWallet
