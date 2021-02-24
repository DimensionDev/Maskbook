import React, { memo, useState } from 'react'
import { TabContext, TabPanel } from '@material-ui/lab'
import { Button, createStyles, Tab, experimentalStyled as styled, makeStyles, FilledInput } from '@material-ui/core'
import { ButtonGroupTabList } from '@dimensiondev/maskbook-theme'
import { DesktopMnemonicConfirm } from '../../components/Mnemonic'
import { MaskAlert } from '../../components/MaskAlert'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const ButtonGroupTabContainer = styled('div')`
    width: 582px;
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

const useTabPanelStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 0,
            marginTop: theme.spacing(3),
            width: 582,
        },
    }),
)

const walletTabs = ['Mnemonic', 'JSON File', 'Private Key']

export const ImportWallet = memo(() => {
    const tabClasses = useTabPanelStyles()
    const [activeTab, setActiveTab] = useState(walletTabs[0])

    return (
        <>
            <Container>
                <TabContext value={walletTabs.includes(activeTab) ? activeTab : walletTabs[0]}>
                    <ButtonGroupTabContainer>
                        <ButtonGroupTabList
                            onChange={(e, v) => setActiveTab(v)}
                            aria-label="Create Wallet Tabs"
                            fullWidth>
                            {walletTabs.map((x) => (
                                <Tab key={x} value={x} label={x} />
                            ))}
                        </ButtonGroupTabList>
                    </ButtonGroupTabContainer>
                    <TabPanel value="Mnemonic" key="Mnemonic" classes={tabClasses}>
                        <DesktopMnemonicConfirm onChange={() => {}} />
                    </TabPanel>
                    <TabPanel value="Private Key" key="Private Key" classes={tabClasses}>
                        <PrivateKeyInput />
                        <PasswordInput placeholder="Wallet Password" />
                    </TabPanel>
                </TabContext>
                <ControlContainer>
                    <Button color="secondary">Cancel</Button>
                    <Button color="primary">Import</Button>
                </ControlContainer>
                <AlertContainer>
                    <MaskAlert />
                </AlertContainer>
            </Container>
        </>
    )
})
