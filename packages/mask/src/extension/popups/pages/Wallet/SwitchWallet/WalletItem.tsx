import { memo, useCallback } from 'react'
import { useHover } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID, PopupRoutes, type Wallet } from '@masknet/shared-base'
import { useReverseAddress } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import { ListItem, ListItemText, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { WalletContext } from '../hooks/useWalletContext.js'
import { CopyIconButton } from '../../../components/CopyIconButton/index.js'

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
        width: 12,
        height: 12,
        color: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
    domain: {
        marginLeft: 4,
    },
    name: {
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
        width: 16,
        height: 16,
        color: '#1C68F3',
        marginLeft: 10,
        cursor: 'pointer',
    },
    setting: {
        width: 12,
        height: 12,
        cursor: 'pointer',
        color: '#1C68F3',
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
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.address)
    const navigate = useNavigate()
    const { setSelectedWallet } = WalletContext.useContainer()

    const handleRename = useCallback(
        (event: React.MouseEvent<HTMLOrSVGElement>) => {
            event.stopPropagation()
            setSelectedWallet(wallet)
            navigate(PopupRoutes.WalletRename)
        },
        [wallet],
    )

    const handleEdit = useCallback(
        (event: React.MouseEvent<HTMLOrSVGElement>) => {
            event.stopPropagation()
            setSelectedWallet(wallet)
            navigate(PopupRoutes.WalletSettings)
        },
        [wallet],
    )

    const [element] = useHover((isHovering) => (
        <ListItem className={classes.item} onClick={onClick} style={{ paddingRight: isSelected ? 10 : 42 }}>
            {wallet.owner ? <Icons.SmartPay /> : <Icons.MaskWallet />}
            <ListItemText className={classes.text}>
                <Typography className={classes.name}>
                    <Typography component="span" display="flex" alignItems="center">
                        {wallet.name}
                        {domain ? (
                            <Typography component="span" className={classes.domain}>
                                ({formatDomainName(domain)})
                            </Typography>
                        ) : null}
                        {isHovering ? <Icons.Edit className={classes.edit} onClick={handleRename} /> : null}
                    </Typography>
                </Typography>
                <Typography className={classes.address}>
                    <FormattedAddress address={wallet.address} size={4} formatter={formatEthereumAddress} />
                    <CopyIconButton className={classes.copy} text={wallet.address} />
                    <Icons.Setting className={classes.setting} onClick={handleEdit} />
                </Typography>
            </ListItemText>
            {isSelected ? <Icons.Success style={{ marginLeft: 8, fontSize: 18 }} /> : null}
        </ListItem>
    ))

    return element
})
