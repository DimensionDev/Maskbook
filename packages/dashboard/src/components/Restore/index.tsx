import { memo } from 'react'
import { experimentalStyled as styled, makeStyles } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { RestoreFromJson } from './RestoreFromJson'
import { RestoreFromMnemonic } from './RestoreFromMnemonic'
import { RestoreFromCloud } from './RestoreFromCloud'
import { RestoreFromPrivateKey } from './RestoreFromPrivateKey'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const useStyles = makeStyles((theme) => ({
    tabs: {
        width: 582,
        justifyContent: 'center',
    },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        marginTop: theme.spacing(3),
        width: '100%',
    },
}))

export const Restore = memo(() => {
    const classes = useStyles()
    const t = useDashboardI18N()

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
        },
    )
    return <Container>{tabs}</Container>
})
