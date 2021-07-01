import { memo } from 'react'
import { Button, experimentalStyled as styled, makeStyles, FilledInput } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { DesktopMnemonicConfirm } from '../../../../components/Mnemonic'
import { MaskAlert } from '../../../../components/MaskAlert'
import { useDashboardI18N } from '../../../../locales'

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

const useStyles = makeStyles((theme) => ({
    tabs: { width: 582, justifyContent: 'center' },
    panels: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0,
        marginTop: theme.spacing(3),
        /* TODO: mobile */
        width: 582,
    },
}))

export const ImportWallet = memo(() => {
    const classes = useStyles()

    const t = useDashboardI18N()
    const tabs = useTabs(
        t.wallets_import_wallet_tabs(),
        {
            mnemonic: t.wallets_wallet_mnemonic(),
            json: t.wallets_wallet_json_file(),
            privateKey: t.wallets_wallet_private_key(),
        },
        {
            mnemonic: <DesktopMnemonicConfirm onChange={() => {}} />,
            json: 'TBD',
            privateKey: (
                <>
                    <PrivateKeyInput />
                    <PasswordInput placeholder={t.wallets_import_wallet_password_placeholder()} />
                </>
            ),
        },
        {
            variant: 'buttonGroup',
            tabPanelClasses: { root: classes.panels },
            buttonTabGroupClasses: { root: classes.tabs },
        },
    )
    return (
        <>
            <Container>
                {tabs}
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
