import { memo, useCallback, useMemo } from 'react'
import { Button, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { WalletHeader } from '../components/WalletHeader'
import { isSameAddress, ProviderType, useWallet, useWallets } from '@masknet/web3-shared'
import { CopyIcon, MaskWalletIcon } from '@masknet/icons'
import { FormattedAddress, useValueRef } from '@masknet/shared'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { useI18N } from '../../../../../utils'
import { useWalletHD } from '../../../../../plugins/Wallet/hooks/useWalletHD'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useCopyToClipboard } from 'react-use'
import { currentAccountMaskWalletSettings, currentProviderSettings } from '../../../../../plugins/Wallet/settings'
import { useLocation } from 'react-router'
import Services from '../../../../service'
import { WalletInfo } from '../components/WalletInfo'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
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
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
    },
    button: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
})

const SelectWallet = memo(() => {
    const { t } = useI18N()
    const walletHD = useWalletHD()
    const { classes } = useStyles()

    const currentProvider = useValueRef(currentProviderSettings)
    const location = useLocation()
    const history = useHistory()
    const wallet = useWallet()
    const wallets = useWallets(ProviderType.MaskWallet)

    const [, copyToClipboard] = useCopyToClipboard()

    const toBeClose = new URLSearchParams(location.search).get('toBeClose')

    console.log(toBeClose)
    const walletList = useMemo(() => {
        return currentProvider !== ProviderType.MaskWallet && toBeClose
            ? wallets
            : wallets.filter((item) => !isSameAddress(item.address, wallet?.address))
    }, [wallet, wallets, currentProvider])

    const handleClickCreate = useCallback(() => {
        if (!walletHD) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/next.html#/create-mask-wallet'),
            })
        } else {
            history.push(PopupRoutes.CreateWallet)
        }
    }, [walletHD, history])

    const handleSelect = useCallback(
        async (address) => {
            if (toBeClose) {
                await WalletRPC.updateAccount({
                    account: address,
                    providerType: ProviderType.MaskWallet,
                })
                await Services.Helper.removePopupWindow()
            } else {
                currentAccountMaskWalletSettings.value = address
                history.replace(PopupRoutes.Wallet)
            }
        },
        [history, toBeClose],
    )

    const onCopy = useCallback(
        (address: string) => {
            copyToClipboard(address)
        },
        [copyToClipboard],
    )

    return (
        <>
            <WalletHeader />
            {currentProvider === ProviderType.MaskWallet || !toBeClose ? <WalletInfo /> : null}
            <div className={classes.content}>
                <List dense className={classes.list}>
                    {walletList.map((item, index) => (
                        <ListItem className={classes.item} key={index} onClick={() => handleSelect(item.address)}>
                            <MaskWalletIcon />
                            <ListItemText className={classes.text}>
                                <Typography className={classes.name}>{item.name}</Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress address={item.address} size={12} />
                                    <CopyIcon className={classes.copy} onClick={() => onCopy(item.address)} />
                                </Typography>
                            </ListItemText>
                        </ListItem>
                    ))}
                </List>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    onClick={handleClickCreate}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}>
                    {t('create')}
                </Button>
                <Button
                    variant="contained"
                    className={classes.button}
                    onClick={() => history.push(PopupRoutes.ImportWallet)}>
                    {t('import')}
                </Button>
            </div>
        </>
    )
})

export default SelectWallet
