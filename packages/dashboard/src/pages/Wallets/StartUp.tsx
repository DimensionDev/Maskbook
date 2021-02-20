import { experimentalStyled as styled } from '@material-ui/core/styles'
import { StartupActionList, StartupActionListItem } from '../../components/StartupActionList'
import { MaskWalletIcon, ImportWalletIcon, CloudLinkIcon } from '@dimensiondev/icons'
import { useDashboardI18N } from '../../locales'

export const Container = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
`

export function StartUp() {
    const t = useDashboardI18N()
    return (
        <Container>
            <StartupActionList>
                <StartupActionListItem
                    icon={<MaskWalletIcon />}
                    title={t.wallets_startup_create()}
                    description={t.wallets_startup_create_desc()}
                    action={t.wallets_startup_create_action()}
                    onClick={() => {}}
                />
                <StartupActionListItem
                    icon={<ImportWalletIcon />}
                    title={t.wallets_startup_import()}
                    description={t.wallets_startup_import_desc()}
                    action={t.wallets_startup_import_action()}
                    onClick={() => {}}
                />
                <StartupActionListItem
                    icon={<CloudLinkIcon />}
                    title={t.wallets_startup_connect()}
                    description={t.wallets_startup_connect_desc()}
                    action={t.wallets_startup_connect_action()}
                    onClick={() => {}}
                />
            </StartupActionList>
        </Container>
    )
}
