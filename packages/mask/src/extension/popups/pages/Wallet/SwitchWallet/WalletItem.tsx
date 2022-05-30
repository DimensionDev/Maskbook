import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID, Wallet } from '@masknet/web3-shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { MaskWalletIcon, SuccessIcon } from '@masknet/icons'
import { ListItem, ListItemText, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { CopyIconButton } from '../../../components/CopyIconButton'

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
    domain: {
        marginLeft: 4,
    },
    name: {
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
        marginLeft: 4,
    },
    edit: {
        fontSize: 16,
        stroke: '#1C68F3',
        fill: 'none',
        marginLeft: 10,
        cursor: 'pointer',
    },
    setting: {
        fontSize: 12,
        cursor: 'pointer',
        fill: 'none',
        stroke: '#1C68F3',
        marginLeft: 4,
    },
})

export interface WalletItemProps {
    wallet: Wallet
    onClick: () => void
    isSelected: boolean
}

export const WalletItem = memo<WalletItemProps>(({ wallet, onClick, isSelected }) => {
    const { classes } = useStyles()
    const { Others } = useWeb3State()
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.address)

    return (
        <ListItem className={classes.item} onClick={onClick} style={{ paddingRight: isSelected ? 10 : 42 }}>
            <MaskWalletIcon />
            <ListItemText className={classes.text}>
                <Typography className={classes.name}>
                    <Typography component="span">{wallet.name}</Typography>
                    {domain && Others?.formatDomainName ? (
                        <Typography component="span">{Others.formatDomainName(domain)}</Typography>
                    ) : null}
                </Typography>
                <Typography className={classes.address}>
                    <FormattedAddress address={wallet.address} size={16} formatter={formatEthereumAddress} />
                    <CopyIconButton className={classes.copy} text={wallet.address} />
                </Typography>
            </ListItemText>
            {isSelected ? <SuccessIcon style={{ marginLeft: 8 }} /> : null}
        </ListItem>
    )
})
