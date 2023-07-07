import { Icons } from '@masknet/icons'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { Link, List, ListItem, ListItemText } from '@mui/material'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { WalletContext } from '../hooks/useWalletContext.js'

const useStyles = makeStyles()((theme) => ({
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
        padding: theme.spacing(1.5, 2),
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    text: {
        margin: '0 0 0 15px',
        color: '#1C68F3',
        lineHeight: 1.5,
        fontWeight: 700,
        fontSize: 16,
    },
}))

const WalletSettings = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const currentWallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { selectedWallet } = WalletContext.useContainer()

    const wallet = selectedWallet ?? currentWallet

    const { classes } = useStyles()

    useTitle(t('popups_wallet_setting'))

    if (!wallet) return null

    return (
        <div className={classes.content}>
            <List dense className={classes.list}>
                {!wallet.owner ? (
                    <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.BackupWallet)}>
                        <Icons.BackUp size={20} />
                        <ListItemText className={classes.text}>{t('popups_wallet_backup_wallet')}</ListItemText>
                    </ListItem>
                ) : null}
                {wallet?.configurable && !wallet.owner ? (
                    <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.DeleteWallet)}>
                        <Icons.PopupTrash size={20} />
                        <ListItemText className={classes.text}>{t('delete_wallet')}</ListItemText>
                    </ListItem>
                ) : null}
                {wallet.owner ? (
                    <ListItem
                        className={classes.item}
                        onClick={() => {
                            navigate(PopupRoutes.ChangeOwner)
                        }}>
                        <Icons.Cached size={20} />
                        <ListItemText className={classes.text}>{t('popups_change_owner')}</ListItemText>
                    </ListItem>
                ) : null}
                <Link
                    href={explorerResolver.addressLink(chainId, wallet?.address ?? '')}
                    target="_blank"
                    rel="noopener noreferrer">
                    <ListItem className={classes.item}>
                        <Icons.CloudLink size={20} />
                        <ListItemText className={classes.text}>{t('popups_wallet_view_on_explorer')}</ListItemText>
                    </ListItem>
                </Link>
            </List>
        </div>
    )
})

export default WalletSettings
