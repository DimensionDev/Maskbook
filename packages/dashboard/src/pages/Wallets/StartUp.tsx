import { styled } from '@material-ui/core/styles'
import { StartupActionList, StartupActionListItem } from '../../components/StartupActionList'
import { MaskWalletIcon, ImportWalletIcon, CloudLinkIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'

const Container = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`

export function StartUp() {
    const t = useDashboardI18N()
    return (
        <Container>
            <StartupActionList>
                <StartupActionListItem
                    icon={<MaskWalletIcon fontSize="inherit" />}
                    title={t.wallets_startup_create()}
                    description={t.wallets_startup_create_desc()}
                    action={t.wallets_startup_create_action()}
                    onClick={() => {}}
                />
                <StartupActionListItem
                    icon={<ImportWalletIcon fontSize="inherit" />}
                    title={t.wallets_startup_import()}
                    description={t.wallets_startup_import_desc()}
                    action={t.wallets_startup_import_action()}
                    onClick={() => {}}
                />
                <StartupActionListItem
                    icon={<CloudLinkIcon fontSize="inherit" />}
                    title={t.wallets_startup_connect()}
                    description={t.wallets_startup_connect_desc()}
                    action={t.wallets_startup_connect_action()}
                    onClick={() => {}}
                />
            </StartupActionList>
        </Container>
    )
}
