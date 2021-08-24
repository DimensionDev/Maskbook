import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { SettingIcon } from '@masknet/icons'
import { NetworkSelector } from '../../../../components/NetworkSelector'
import { useHistory } from 'react-router'
import { PopupRoutes } from '../../../../index'

const useStyles = makeStyles()({
    container: {
        padding: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    setting: {
        stroke: '#1C68F3',
        fill: 'none',
        cursor: 'pointer',
        fontSize: 18,
    },
})

export const WalletHeader = memo(() => {
    const { classes } = useStyles()
    const history = useHistory()

    return (
        <div>
            <div className={classes.container}>
                <NetworkSelector />
                <SettingIcon className={classes.setting} onClick={() => history.push(PopupRoutes.SelectWallet)} />
            </div>
        </div>
    )
})
