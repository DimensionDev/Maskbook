import { Button, createStyles, experimentalStyled as styled, FilledInput, Tab, makeStyles } from '@material-ui/core'
import { ButtonGroupTabList, MaskColorVar } from '@dimensiondev/maskbook-theme'
import React, { useState } from 'react'
import { TabContext, TabPanel } from '@material-ui/lab'
import { RefreshIcon } from '@dimensiondev/icons'
import { MnemonicReveal } from '../../components/Mnemonic'
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

const Refresh = styled('div')(
    ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 584px;
    margin: ${theme.spacing(2, 0)};
    font-size: ${theme.typography.fontSize};
    line-height: 20px;
    color: ${theme.palette.primary.main};
    cursor: pointer;
`,
)

const MnemonicGeneratorContainer = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(4, 5)};
    background-color: ${theme.palette.background.default};
    border-radius: 8px;
`,
)

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
    color: ${MaskColorVar.textSecondary};
`,
)

const PrivateKeyInput = styled(FilledInput)(
    ({ theme }) => `
    width: 582px;
    height: 182px;
    margin-top: ${theme.spacing(3)};
`,
)

const useTabPanelStyles = makeStyles(() =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 0,
        },
    }),
)

const walletTabs = ['Mnemonic', 'JSON File', 'Private Key']

export function CreateWallet() {
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
                    <TabPanel key="Mnemonic" value="Mnemonic" classes={tabClasses}>
                        <Refresh>
                            <RefreshIcon />
                            <span>Refresh</span>
                        </Refresh>
                        <MnemonicGeneratorContainer>
                            <MnemonicReveal words={[...Array(12).keys()].map((i) => String(i))} />
                        </MnemonicGeneratorContainer>
                    </TabPanel>
                    <TabPanel key="Private Key" value="Private Key" classes={tabClasses}>
                        <PrivateKeyInput />
                    </TabPanel>
                </TabContext>

                <ControlContainer>
                    <Button color="secondary">Remember that later</Button>
                    <Button color="primary">Verification</Button>
                </ControlContainer>
                <AlertContainer>
                    <MaskAlert />
                </AlertContainer>
            </Container>
        </>
    )
}
