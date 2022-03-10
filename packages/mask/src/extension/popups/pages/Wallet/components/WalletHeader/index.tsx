import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { SettingIcon } from '@masknet/icons'
import { NetworkSelector } from '../../../../components/NetworkSelector'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()({
    container: {
        padding: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
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
    const navigate = useNavigate()

    return (
        <div>
            <div className={classes.container}>
                <NetworkSelector />
                <SettingIcon className={classes.setting} onClick={() => navigate(PopupRoutes.SwitchWallet)} />
            </div>
        </div>
    )
})
