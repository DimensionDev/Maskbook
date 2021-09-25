import { memo, useCallback, useState } from 'react'
import { useI18N } from '../../../../../utils'
import { makeStyles } from '@masknet/theme'
import { useLocation } from 'react-router'
import {
    ChainId,
    getNetworkName,
    isSameAddress,
    ProviderType,
    useAccount,
    useChainIdValid,
    useWallets,
} from '@masknet/web3-shared'
import { ChainIcon, FormattedAddress } from '@masknet/shared'
import { Button, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { CopyIcon, MaskWalletIcon } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { SuccessIcon } from '@masknet/icons'
import Services from '../../../../service'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

const useStyles = makeStyles()({
    content: {
        flex: 1,
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
    const location = useLocation()
    const wallet = useAccount()
    const wallets = useWallets()

    const [selected, setSelected] = useState(wallet)
    const [, copyToClipboard] = useCopyToClipboard()

    const search = new URLSearchParams(location.search)

    const chainId = parseInt(search.get('chainId') ?? '0', 10) as ChainId

    const chainIdValid = useChainIdValid()

    const onCopy = useCallback(
        (address: string) => {
            copyToClipboard(address)
        },
        [copyToClipboard],
    )

    const handleCancel = useCallback(() => Services.Helper.removePopupWindow(), [])

    const handleConfirm = useCallback(async () => {
        await WalletRPC.updateAccount({
            chainId,
            account: selected,
            providerType: ProviderType.MaskWallet,
        })
        await WalletRPC.updateMaskAccount({
            chainId,
            account: selected,
        })

        return Services.Helper.removePopupWindow()
    }, [chainId, selected])

    return chainIdValid ? (
        <>
            <div className={classes.content}>
                <div className={classes.header}>
                    <div className={classes.network}>
                        <div className={classes.iconWrapper}>
                            <ChainIcon chainId={chainId} />
                        </div>
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
                                            <FormattedAddress address={item.address} size={12} />
                                            <CopyIcon className={classes.copy} onClick={() => onCopy(item.address)} />
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
                <Button variant="contained" className={classes.button} onClick={handleConfirm} disabled={!selected}>
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
