import React, { memo, useState } from 'react'
import { TabContext, TabPanel } from '@material-ui/lab'
import { Button, createStyles, Tab, experimentalStyled as styled, makeStyles, FilledInput } from '@material-ui/core'
import { ButtonGroupTabList } from '@dimensiondev/maskbook-theme'
import { DesktopMnemonicConfirm } from '../../components/Mnemonic'
import { MaskAlert } from '../../components/MaskAlert'
import { useDashboardI18N } from '../../locales'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const ButtonGroupTabContainer = styled('div')`
    /* TODO: mobile */
    width: 582px;
`

const ControlContainer = styled('div')(
    ({ theme }) => `
    margin-top: ${theme.spacing(6)};
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(2, 180px);
    gap: 24px;
    /* TODO: mobile */
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
    /* TODO: mobile */
    width: 582px;
    height: 182px;
    margin-top: ${theme.spacing(3)};
`,
)

const PasswordInput = styled(FilledInput)(
    ({ theme }) => `
    /* TODO: mobile */
    width: 582px;
    margin-top: ${theme.spacing(3)};
`,
)

const useTabPanelStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 0,
            marginTop: theme.spacing(3),
            /* TODO: mobile */
            width: 582,
        },
    }),
)

const walletTabs = ['mnemonic', 'jsonFile', 'privateKey'] as const
type TabType = typeof walletTabs[number]

export const ImportWallet = memo(() => {
    const tabClasses = useTabPanelStyles()

    const t = useDashboardI18N()
    const walletTabsLabel: Record<TabType, string> = {
        mnemonic: t.wallets_wallet_mnemonic(),
        jsonFile: t.wallets_wallet_json_file(),
        privateKey: t.wallets_wallet_private_key(),
    }

    const [activeTab, setActiveTab] = useState<TabType>(walletTabs[0])

    return (
        <>
            <Container>
                <TabContext value={walletTabs.includes(activeTab) ? activeTab : walletTabs[0]}>
                    <ButtonGroupTabContainer>
                        <ButtonGroupTabList
                            onChange={(e, v: TabType) => setActiveTab(v)}
                            aria-label={t.wallets_import_wallet_tabs()}
                            fullWidth>
                            {walletTabs.map((key) => (
                                <Tab key={key} value={key} label={walletTabsLabel[key]} />
                            ))}
                        </ButtonGroupTabList>
                    </ButtonGroupTabContainer>
                    <TabPanel value="mnemonic" key="Mnemonic" classes={tabClasses}>
                        <DesktopMnemonicConfirm onChange={() => {}} />
                    </TabPanel>
                    <TabPanel value="privateKey" key="privateKey" classes={tabClasses}>
                        <PrivateKeyInput />
                        <PasswordInput placeholder={t.wallets_import_wallet_password_placeholder()} />
                    </TabPanel>
                </TabContext>
                <ControlContainer>
                    <Button color="secondary">{t.wallets_import_wallet_cancel()}</Button>
                    <Button color="primary">{t.wallets_import_wallet_import()}</Button>
                </ControlContainer>
                <AlertContainer>
                    <MaskAlert />
                </AlertContainer>
            </Container>
        </>
    )
})
