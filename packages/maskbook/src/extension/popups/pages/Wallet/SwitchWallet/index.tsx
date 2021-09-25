import { memo, useCallback, useMemo } from 'react'
import { Button, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { WalletHeader } from '../components/WalletHeader'
import { isSameAddress, ProviderType, useWallet, useWalletPrimary, useWallets } from '@masknet/web3-shared'
import { CopyIcon, MaskWalletIcon } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { useI18N } from '../../../../../utils'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useCopyToClipboard } from 'react-use'
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

const SwitchWallet = memo(() => {
    const { t } = useI18N()
    const walletPrimary = useWalletPrimary()
    const { classes } = useStyles()

    const history = useHistory()
    const wallet = useWallet()
    const wallets = useWallets(ProviderType.MaskWallet)

    const [, copyToClipboard] = useCopyToClipboard()

    const walletList = useMemo(
        () => wallets.filter((item) => !isSameAddress(item.address, wallet?.address)),
        [wallet, wallets],
    )

    const handleClickCreate = useCallback(() => {
        if (!walletPrimary) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/next.html#/create-mask-wallet'),
            })
        } else {
            history.push(PopupRoutes.CreateWallet)
        }
    }, [walletPrimary, history])

    const handleSelect = useCallback(
        async (address) => {
            await WalletRPC.updateMaskAccount({
                account: address,
            })
            history.replace(PopupRoutes.Wallet)
        },
        [history],
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
            <WalletInfo />
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

export default SwitchWallet
