import { memo } from 'react'
import { TabContext, TabPanel } from '@mui/lab'
import { Button, styled, FilledInput, Tab } from '@mui/material'
import { makeStyles, ButtonGroupTabList, useTabs } from '@masknet/theme'
import { DesktopMnemonicConfirm } from '../../../../components/Mnemonic/index.js'
import { MaskAlert } from '../../../../components/MaskAlert/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const ControlContainer = styled('div')(
    ({ theme }) => `
    margin-top: ${theme.spacing(6)};
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(2, 180px);
    gap: 24px;
    width: 584px;
`,
)

const AlertContainer = styled('div')(
    ({ theme }) => `
    width: 676px;
    margin-top: ${theme.spacing(7)};
`,
)

const PrivateKeyInput = styled(FilledInput)(
    ({ theme }) => `
    width: 582px;
    height: 182px;
    margin-top: ${theme.spacing(3)};
`,
)

const PasswordInput = styled(FilledInput)(
    ({ theme }) => `
    width: 582px;
    margin-top: ${theme.spacing(3)};
`,
)

const useStyles = makeStyles()((theme) => ({
    tabs: { width: 582, justifyContent: 'center' },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        marginTop: theme.spacing(3),
        width: 582,
    },
}))

export const ImportWallet = memo(() => {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    const [currentTab, onChange, tabs] = useTabs('mnemonic', 'json', 'privateKey')
    const tabPanelClasses = { root: classes.panels }
    return (
        <>
            <Container>
                <TabContext value={currentTab}>
                    <ButtonGroupTabList
                        classes={{ root: classes.tabs }}
                        onChange={onChange}
                        aria-label={t.wallets_import_wallet_tabs()}>
                        <Tab label={t.wallets_wallet_mnemonic()} value={tabs.mnemonic} />
                        <Tab label={t.wallets_wallet_json_file()} value={tabs.json} />
                        <Tab label={t.wallets_wallet_private_key()} value={tabs.privateKey} />
                    </ButtonGroupTabList>
                    <TabPanel classes={tabPanelClasses} value={tabs.mnemonic}>
                        <DesktopMnemonicConfirm puzzleWords={[]} onChange={() => {}} />
                    </TabPanel>
                    <TabPanel classes={tabPanelClasses} value={tabs.json}>
                        TBD
                    </TabPanel>
                    <TabPanel classes={tabPanelClasses} value={tabs.privateKey}>
                        <PrivateKeyInput />
                        <PasswordInput placeholder={t.wallets_import_wallet_password_placeholder()} />
                    </TabPanel>
                </TabContext>
                <ControlContainer>
                    <Button color="secondary">{t.wallets_import_wallet_cancel()}</Button>
                    <Button color="primary">{t.wallets_import_wallet_import()}</Button>
                </ControlContainer>
                <AlertContainer>
                    <MaskAlert description={t.wallets_create_wallet_alert()} />
                </AlertContainer>
            </Container>
        </>
    )
})
