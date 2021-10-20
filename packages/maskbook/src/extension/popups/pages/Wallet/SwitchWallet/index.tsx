import { memo, useCallback } from 'react'
import { Button, List, ListItem, ListItemText, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, ProviderType, useWallet, useWallets, useWalletPrimary } from '@masknet/web3-shared-evm'
import { CopyIcon, MaskWalletIcon, SuccessIcon } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { useI18N } from '../../../../../utils'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useCopyToClipboard } from 'react-use'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { currentProviderSettings } from '../../../../../plugins/Wallet/settings'

const useStyles = makeStyles()({
    header: {
        padding: 10,
        display: 'flex',
        marginBottom: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        overflow: 'auto',
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
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
    button: {
        fontWeight: 600,
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

            if (currentProviderSettings.value === ProviderType.MaskWallet)
                await WalletRPC.updateAccount({ account: address, providerType: ProviderType.MaskWallet })

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
            <div className={classes.header}>
                <NetworkSelector />
            </div>
            <div className={classes.content}>
                <List dense className={classes.list}>
                    {wallets.map((item, index) => (
                        <ListItem className={classes.item} key={index} onClick={() => handleSelect(item.address)}>
                            <MaskWalletIcon />
                            <ListItemText className={classes.text}>
                                <Typography className={classes.name}>{item.name}</Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress address={item.address} size={12} />
                                    <CopyIcon className={classes.copy} onClick={() => onCopy(item.address)} />
                                </Typography>
                            </ListItemText>
                            {isSameAddress(item.address, wallet?.address) ? <SuccessIcon /> : null}
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
