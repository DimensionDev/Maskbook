import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MoreHoriz } from '@mui/icons-material'
import { EditIcon, MaskWalletIcon } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useWallet, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { CopyIconButton } from '../../../../components/CopyIconButton'
import { useReverseAddress } from '@masknet/plugin-infra'

const useStyles = makeStyles()({
    container: {
        padding: '12px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EFF5FF',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    address: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
    },
    edit: {
        fontSize: 16,
        stroke: '#1C68F3',
        fill: 'none',
        marginLeft: 10,
        cursor: 'pointer',
    },
    copy: {
        fontSize: 12,
        stroke: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
    walletBackground: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        width: 24,
        height: 24,
        marginRight: 4,
    },
    tick: {
        fontSize: 12,
        stroke: '#77E0B5',
        marginLeft: 4,
    },
})

export const WalletInfo = memo(() => {
    const wallet = useWallet()
    const history = useHistory()

    const excludePath = useRouteMatch({
        path: PopupRoutes.WalletSettings,
        exact: true,
    })

    if (!wallet) return null

    return (
        <WalletInfoUI
            name={wallet.name ?? ''}
            address={wallet.address}
            onEditClick={() => history.push(PopupRoutes.WalletRename)}
            onSettingClick={() => history.push(PopupRoutes.WalletSettings)}
            hideSettings={!!excludePath}
        />
    )
})

export interface WalletInfoUIProps {
    name: string
    address: string
    onSettingClick: () => void
    onEditClick: () => void
    hideSettings: boolean
}

export const WalletInfoUI = memo<WalletInfoUIProps>(({ name, address, onSettingClick, onEditClick, hideSettings }) => {
    const { classes } = useStyles()
    const { value: domain } = useReverseAddress(address)

    return (
        <div className={classes.container}>
            <div className={classes.left}>
                <div className={classes.walletBackground}>
                    <MaskWalletIcon />
                </div>
                <div>
                    {name && (
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography className={classes.name}>
                                {name} <EditIcon onClick={onEditClick} className={classes.edit} />
                            </Typography>
                            {domain ? <Typography className={classes.name}>{domain}</Typography> : null}
                        </Box>
                    )}
                    <Typography className={classes.address}>
                        <FormattedAddress address={address} size={16} formatter={formatEthereumAddress} />
                        <CopyIconButton text={address ?? ''} className={classes.copy} />
                    </Typography>
                </div>
            </div>
            {!hideSettings ? (
                <MoreHoriz color="primary" style={{ cursor: 'pointer' }} onClick={onSettingClick} />
            ) : null}
        </div>
    )
})
