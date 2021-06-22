import { Button, experimentalStyled as styled, FilledInput, makeStyles, Typography } from '@material-ui/core'
import { MaskColorVar, useTabs } from '@masknet/theme'
import { memo } from 'react'
import { RefreshIcon } from '@masknet/icons'
import { MnemonicReveal } from '../../../../components/Mnemonic'
import { MaskAlert } from '../../../../components/MaskAlert'
import { useDashboardI18N } from '../../../../locales'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

// TODO: mobile
const ButtonGroupTabContainer = styled('div')`
    width: 582px;
`

const Refresh = styled('div')(
    ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: flex-end;
    /* TODO: Mobile */
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
    /* TODO: Mobile */
    width: 584px;
`,
)

const AlertContainer = styled('div')(
    ({ theme }) => `
    /* TODO: Mobile */
    width: 676px;
    margin-top: ${theme.spacing(7)};
    color: ${MaskColorVar.textSecondary};
`,
)

const PrivateKeyInput = styled(FilledInput)(
    ({ theme }) => `
    /* TODO: Mobile */
    width: 582px;
    height: 182px;
    margin-top: ${theme.spacing(3)};
`,
)

const useTabPanelStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
    },
}))

export const CreateWallet = memo(() => {
    const t = useDashboardI18N()

    const tabs = useTabs(
        t.wallets_create_wallet_tabs(),
        {
            mnemonic: t.wallets_wallet_mnemonic(),
            json: t.wallets_wallet_json_file(),
            privateKey: t.wallets_wallet_private_key(),
        },
        {
            mnemonic: (
                <>
                    <Refresh>
                        <RefreshIcon />
                        <Typography>{t.wallets_create_wallet_refresh()}</Typography>
                    </Refresh>
                    <MnemonicGeneratorContainer>
                        <MnemonicReveal words={[...Array(12).keys()].map((i) => String(i))} />
                    </MnemonicGeneratorContainer>
                </>
            ),
            json: 'TODO: ',
            privateKey: <PrivateKeyInput />,
        },
        { variant: 'buttonGroup', tabPanelClasses: useTabPanelStyles() },
    )
    return (
        <Container>
            {tabs}
            <ControlContainer>
                <Button color="secondary">{t.wallets_create_wallet_remember_later()}</Button>
                <Button color="primary">{t.wallets_create_wallet_verification()}</Button>
            </ControlContainer>
            <AlertContainer>
                <MaskAlert />
            </AlertContainer>
        </Container>
    )
})
