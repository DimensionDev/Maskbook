import { memo } from 'react'
import { useNavigate, useLocation, useMatch } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MoreHoriz } from '@mui/icons-material'
import { Icons } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { CopyIconButton } from '../../../../components/CopyIconButton/index.js'
import { useReverseAddress, useWallet, useWeb3State } from '@masknet/web3-hooks-base'

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
        color: '#1C68F3',
        marginLeft: 10,
        cursor: 'pointer',
    },
    copy: {
        height: 12,
        width: 12,
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
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const navigate = useNavigate()
    const address = new URLSearchParams(useLocation().search).get('address')
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, address ?? wallet?.address)
    const { Others } = useWeb3State()

    const excludePath = useMatch(PopupRoutes.WalletSettings)

    if (!wallet) return null

    return (
        <WalletInfoUI
            name={wallet.name ?? ''}
            address={wallet.address}
            onEditClick={() => navigate(PopupRoutes.WalletRename)}
            onSettingClick={() => navigate(PopupRoutes.WalletSettings)}
            hideSettings={!!excludePath}
            domain={domain}
            formatDomainName={Others?.formatDomainName}
        />
    )
})

export interface WalletInfoUIProps {
    name: string
    address: string
    onSettingClick: () => void
    onEditClick: () => void
    hideSettings: boolean
    domain?: string
    formatDomainName?: (domain?: string, size?: number) => string | undefined
}

export const WalletInfoUI = memo<WalletInfoUIProps>(
    ({ name, address, onSettingClick, onEditClick, hideSettings, domain, formatDomainName }) => {
        const { classes } = useStyles()

        return (
            <div className={classes.container}>
                <div className={classes.left}>
                    <div className={classes.walletBackground}>
                        <Icons.MaskWallet />
                    </div>
                    <div>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography className={classes.name}>
                                {name} <Icons.Edit size={16} onClick={onEditClick} className={classes.edit} />
                            </Typography>
                            {domain && formatDomainName ? (
                                <Typography className={classes.name}>{formatDomainName(domain)}</Typography>
                            ) : null}
                        </Box>

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
    },
)
