import { memo } from 'react'
import { NetworkPluginID, Wallet } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { Icon } from '@masknet/icons'
import { ListItem, ListItemText, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { CopyIconButton } from '../../../components/CopyIconButton'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()({
    item: {
        padding: 10,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
    },
    address: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
    },
    copy: {
        fontSize: 12,
        fill: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
    name: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
})

export interface WalletItemProps {
    wallet: Wallet
    onClick: () => void
    isSelected: boolean
}

export const WalletItem = memo<WalletItemProps>(({ wallet, onClick, isSelected }) => {
    const { classes } = useStyles()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.address)

    return (
        <ListItem className={classes.item} onClick={onClick}>
            <Icon type="maskWallet" />
            <ListItemText className={classes.text}>
                <div className={classes.listItem}>
                    <div>
                        <Typography className={classes.name}>
                            <Typography component="span"> {wallet.name}</Typography>
                            {domain && Others?.formatDomainName ? (
                                <Typography component="span">{Others.formatDomainName(domain)}</Typography>
                            ) : null}
                        </Typography>
                        <Typography className={classes.address}>
                            <FormattedAddress address={wallet.address} size={12} formatter={Others?.formatAddress} />
                            <CopyIconButton className={classes.copy} text={wallet.address} />
                        </Typography>
                    </div>
                    {isSelected ? <Icon type="success" /> : null}
                </div>
            </ListItemText>
        </ListItem>
    )
})
