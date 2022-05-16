import { Box, Link, List, ListItem, ListItemText, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { BackUpIcon, CloudLinkIcon, MaskWalletIcon, TrashIcon } from '@masknet/icons'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useI18N } from '../../../../../utils'
import { formatEthereumAddress, resolveAddressLinkOnExplorer, useChainId, useWallet } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { FormattedAddress } from '@masknet/shared'
import { CopyIconButton } from '../../../components/CopyIconButton'
import { WalletContext } from '../hooks/useWalletContext'
import { Navigator } from '../../../components/Navigator'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()((theme) => ({
    header: {
        padding: 10,
        borderBottom: '1px solid #F7F9FA',
        display: 'flex',

        alignItems: 'center',
    },
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
    icon: {
        fontSize: 20,
    },
    name: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    address: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
    },
    copy: {
        fontSize: 12,
        cursor: 'pointer',
        fill: '#1C68F3',
        marginLeft: 4,
    },
}))

const WalletSettings = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const chainId = useChainId()
    const { selectedWallet } = WalletContext.useContainer()
    const currentWallet = useWallet()

    const wallet = selectedWallet ?? currentWallet

    const { classes } = useStyles()

    const { value: domain } = useReverseAddress(wallet?.address ?? '', NetworkPluginID.PLUGIN_EVM)
    const { Others } = useWeb3State()

    useTitle(t('popups_wallet_setting'))

    if (!wallet) return null

    return (
        <>
            <div className={classes.header}>
                <MaskWalletIcon style={{ marginRight: 4 }} />
                <div>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography className={classes.name}>{wallet.name}</Typography>
                        {domain && Others?.formatDomainName ? (
                            <Typography className={classes.name} style={{ marginLeft: 4 }}>
                                ({Others?.formatDomainName(domain)})
                            </Typography>
                        ) : null}
                    </Box>
                    <Typography className={classes.address}>
                        <FormattedAddress address={wallet.address} size={4} formatter={formatEthereumAddress} />
                        <CopyIconButton text={wallet.address} className={classes.copy} />
                    </Typography>
                </div>
            </div>
            <div className={classes.content}>
                <List dense className={classes.list}>
                    <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.BackupWallet)}>
                        <BackUpIcon className={classes.icon} />
                        <ListItemText className={classes.text}>{t('popups_wallet_backup_wallet')}</ListItemText>
                    </ListItem>
                    {wallet?.configurable ? (
                        <ListItem className={classes.item} onClick={() => navigate(PopupRoutes.DeleteWallet)}>
                            <TrashIcon className={classes.icon} />
                            <ListItemText className={classes.text}>{t('delete_wallet')}</ListItemText>
                        </ListItem>
                    ) : null}
                    <Link
                        href={resolveAddressLinkOnExplorer(chainId, wallet?.address ?? '')}
                        target="_blank"
                        rel="noopener noreferrer">
                        <ListItem className={classes.item}>
                            <CloudLinkIcon className={classes.icon} />
                            <ListItemText className={classes.text}>{t('popups_wallet_view_on_explorer')}</ListItemText>
                        </ListItem>
                    </Link>
                </List>
            </div>
            <Navigator />
        </>
    )
})

export default WalletSettings
