import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@material-ui/core'
import { useValueRef } from '@masknet/shared'
import { NetworkType } from '@masknet/web3-shared'
import { useHistory, useLocation } from 'react-router'
import { noop } from 'lodash-es'
import { useI18N } from '../../../../../utils'
import { GasSetting1559 } from './GasSetting1559'
import { Prior1559GasSetting } from './Prior1559GasSetting'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { useRejectHandler } from '../hooks/useRejectHandler'
import { currentNetworkSettings } from '../../../../../plugins/Wallet/settings'
import { PopupRoutes } from '../../../index'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: 16,
        '& > *': {
            marginTop: 10,
        },
    },
    title: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    description: {
        fontSize: 12,
        lineHeight: '18px',
        color: '#7B8192',
    },
}))

const GasSetting = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const networkType = useValueRef(currentNetworkSettings)
    const location = useLocation()
    const history = useHistory()

    const handleConfirm = useCallback(() => {
        const toBeClose = new URLSearchParams(location.search).get('toBeClose')
        if (toBeClose) {
            window.close()
        } else {
            history.replace(PopupRoutes.TokenDetail)
        }
    }, [location.search, history])

    const { value } = useUnconfirmedRequest()
    useRejectHandler(noop, value)
    return (
        <main className={classes.container}>
            <Typography className={classes.title}>{t('popups_wallet_gas_fee_settings')}</Typography>
            <Typography className={classes.description}>{t('popups_wallet_gas_fee_settings_description')}</Typography>
            {networkType === NetworkType.Ethereum ? (
                <GasSetting1559 onConfirm={handleConfirm} />
            ) : (
                <Prior1559GasSetting onConfirm={handleConfirm} />
            )}
        </main>
    )
})

export default GasSetting
