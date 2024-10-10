import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { EVMChainResolver } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useTitle } from '../../../hooks/index.js'
import { GasSetting1559 } from './GasSetting1559.js'
import { Prior1559GasSetting } from './Prior1559GasSetting.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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

export const Component = memo(function GasSetting() {
    const { _ } = useLingui()
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    useTitle(_(msg`Gas fee settings`))
    return (
        <main className={classes.container}>
            <Typography className={classes.title} style={{ marginTop: 0 }}>
                <Trans>Gas fee settings</Trans>
            </Typography>
            <Typography className={classes.description}>
                <Trans>
                    Gas fees are the fees for paying ethereum block builders. Block builders prefer to pack transactions
                    with higher gas fees. Transactions with low gas fees might fail, and the paid gas fees won't be
                    returned.
                </Trans>
            </Typography>
            {EVMChainResolver.isFeatureSupported(chainId, 'EIP1559') ?
                <GasSetting1559 />
            :   <Prior1559GasSetting />}
        </main>
    )
})
