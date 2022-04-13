import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { isEIP1559Supported, useChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils'
import { GasSetting1559 } from './GasSetting1559'
import { Prior1559GasSetting } from './Prior1559GasSetting'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()(() => ({
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
    const chainId = useChainId()
    useTitle(t('popups_gas_fee_settings'))
    return (
        <>
            <main className={classes.container}>
                <Typography className={classes.title} style={{ marginTop: 0 }}>
                    {t('popups_wallet_gas_fee_settings')}
                </Typography>
                <Typography className={classes.description}>
                    {t('popups_wallet_gas_fee_settings_description')}
                </Typography>
                {isEIP1559Supported(chainId) ? <GasSetting1559 /> : <Prior1559GasSetting />}
            </main>
        </>
    )
})

export default GasSetting
