import { memo, useCallback } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MoreHoriz } from '@material-ui/icons'
import { CopyIcon, EditIcon, MaskWalletIcon } from '@masknet/icons'
import { FormattedAddress } from '@masknet/shared'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { PopupRoutes } from '../../../../index'
import { useWallet } from '@masknet/web3-shared-evm'
import { useCopyToClipboard } from 'react-use'

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

    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useCallback(() => {
        copyToClipboard(wallet?.address ?? '')
    }, [wallet, copyToClipboard])

    if (!wallet) return null

    return (
        <WalletInfoUI
            name={wallet.name ?? ''}
            address={wallet.address}
            onEditClick={() => history.push(PopupRoutes.WalletRename)}
            onSettingClick={() => history.push(PopupRoutes.WalletSettings)}
            hideSettings={!!excludePath}
            onCopy={onCopy}
        />
    )
})

export interface WalletInfoUIProps {
    name: string
    address: string
    onSettingClick: () => void
    onEditClick: () => void
    hideSettings: boolean
    onCopy: () => void
}

export const WalletInfoUI = memo<WalletInfoUIProps>(
    ({ name, address, onSettingClick, onEditClick, hideSettings, onCopy }) => {
        const { classes } = useStyles()
        return (
            <div className={classes.container}>
                <div className={classes.left}>
                    <div className={classes.walletBackground}>
                        <MaskWalletIcon />
                    </div>
                    <div>
                        {name && (
                            <Typography className={classes.name}>
                                {name} <EditIcon onClick={onEditClick} className={classes.edit} />
                            </Typography>
                        )}
                        <Typography className={classes.address}>
                            <FormattedAddress address={address} size={12} />
                            <CopyIcon onClick={onCopy} className={classes.copy} />
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
