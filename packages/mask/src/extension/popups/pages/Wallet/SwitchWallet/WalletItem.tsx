import type { Wallet } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { useReverseAddress } from '@masknet/plugin-infra'
import { MaskWalletIcon, SuccessIcon } from '@masknet/icons'
import { ListItem, ListItemText, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { CopyIconButton } from '../../../components/CopyIconButton'

const useStyles = makeStyles()({
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
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
    const { value: domain } = useReverseAddress(wallet.address)

    return (
        <ListItem className={classes.item} onClick={onClick} style={{ paddingRight: isSelected ? 10 : 42 }}>
            <MaskWalletIcon />
            <ListItemText className={classes.text}>
                <Typography className={classes.name}>
                    <Typography component="span">{wallet.name}</Typography>
                    {domain ? <Typography component="span">{domain}</Typography> : null}
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
