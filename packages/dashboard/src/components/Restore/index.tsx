import { memo, useState } from 'react'
import { makeStyles, Stack } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { RestoreFromJson } from './RestoreFromJson'
import { RestoreFromMnemonic } from './RestoreFromMnemonic'
import { RestoreFromCloud } from './RestoreFromCloud'
import { RestoreFromPrivateKey } from './RestoreFromPrivateKey'
import { RestoreBlueLogo, SignUpAccountLogo } from '../RegisterFrame/ColumnContentLayout'

const useStyles = makeStyles((theme) => ({
    tabs: {
        width: '100%',
        display: 'flex',
        marginBottom: theme.spacing(3),
    },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        width: '100%',
    },
}))

export const Restore = memo(() => {
    const classes = useStyles()
    const t = useDashboardI18N()
    const [currentTab, setCurrentTab] = useState('mnemonic')
    const onTabChange = (tabName: string) => setCurrentTab(tabName)

    const tabs = useTabs(
        t.wallets_import_wallet_tabs(),
        {
            mnemonic: t.wallets_wallet_mnemonic(),
            privateKey: t.wallets_wallet_private_key(),
            json: t.wallets_wallet_json_file(),
            cloud: t.cloud_backup(),
        },
        {
            mnemonic: <RestoreFromMnemonic />,
            privateKey: <RestoreFromPrivateKey />,
            json: <RestoreFromJson />,
            cloud: <RestoreFromCloud />,
        },
        {
            variant: 'buttonGroup',
            tabPanelClasses: { root: classes.panels },
            buttonTabGroupClasses: { root: classes.tabs },
            onTabChange,
        },
    )
    return (
        <>
            {['mnemonic', 'privateKey'].includes(currentTab) ? <SignUpAccountLogo /> : <RestoreBlueLogo />}
            <Stack justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                {tabs}
            </Stack>
        </>
    )
})
