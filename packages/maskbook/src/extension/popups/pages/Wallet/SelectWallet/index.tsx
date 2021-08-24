import { memo, useMemo } from 'react'
import { Button, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { WalletHeader } from '../components/WalletHeader'
import { WalletInfo } from '../components/WalletInfo'
import { isSameAddress, ProviderType, useWallet, useWallets } from '@masknet/web3-shared'
import { CopyIcon, MaskWalletIcon } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { useI18N } from '../../../../../utils'

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
        marginLeft: 15,
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
    const { classes } = useStyles()
    const history = useHistory()
    const wallet = useWallet()
    const wallets = useWallets(ProviderType.Maskbook)

    const walletList = useMemo(
        () => wallets.filter((item) => isSameAddress(item.address, wallet?.address)),
        [wallet, wallets],
    )

    return (
        <>
            <WalletHeader />
            <WalletInfo />
            <div className={classes.content}>
                <List dense className={classes.list}>
                    {walletList.map((item, index) => (
                        <ListItem className={classes.item} key={index}>
                            <MaskWalletIcon />
                            <ListItemText className={classes.text}>
                                <Typography className={classes.name}>{item.name}</Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress address={item.address} size={12} />
                                    <CopyIcon className={classes.copy} />
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
                    onClick={() => history.goBack()}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}>
                    {t('cancel')}
                </Button>
                <Button
                    variant="contained"
                    className={classes.button}
                    onClick={() => history.push(PopupRoutes.CreateWallet)}>
                    {t('import')}
                </Button>
            </div>
        </>
    )
})

export default SelectWallet
