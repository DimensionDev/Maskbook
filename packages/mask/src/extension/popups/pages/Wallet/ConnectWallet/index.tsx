import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { supportedWallets } from './constants'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 12,
        rowGap: 16,
        padding: '16px',
        boxSizing: 'border-box',
    },
    walletItem: {
        cursor: 'pointer',
        background: '#fff',
        width: 'calc( 50% - 6px )',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '12px 0',
        boxSizing: 'content-box',
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.text.secondary,
        fontFamily: 'Helvetica',
        height: 'fit-content',
    },
    walletIcon: {
        width: '5rem',
        height: '5rem',
    },
}))
const ConnectWalletPage = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const clickItem = () => {
        navigate(PopupRoutes.VerifyWallet)
    }

    useTitle(t('plugin_wallet_on_connect'))

    return (
        <div className={classes.container}>
            {supportedWallets.map((item, idx) => {
                return (
                    <div key={idx} className={classes.walletItem} onClick={clickItem}>
                        <img src={item.icon} className={classes.walletIcon} />
                        <Typography>{item.title}</Typography>
                    </div>
                )
            })}
        </div>
    )
})

export default ConnectWalletPage
