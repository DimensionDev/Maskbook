import { DesktopMnemonicConfirm } from '../Mnemonic'
import { Services } from '../../API'
import { useList } from 'react-use'
import { Button, Container, makeStyles, Stack } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { some } from 'lodash-es'
import { MaskAlert } from '../MaskAlert'

const useStyles = makeStyles((theme) => ({}))

export const RestoreFromMnemonic = () => {
    const t = useDashboardI18N()
    const classes = useStyles()
    const navigate = useNavigate()
    const [values, { updateAt }] = useList(new Array(12).fill(''))

    const handleSubmit = async () => {
        try {
            const identity = await Services.Identity.recoverIdentityByMnemonic(values.join(' '), '')
            if (identity) {
                Services.Identity.setCurrentIdentity(identity.identifier)
                navigate(RoutePaths.Personas)
            }
        } catch (e) {
            // todo: handle error
        }
    }

    return (
        <>
            <DesktopMnemonicConfirm onChange={(word, index) => updateAt(index, word)} puzzleWords={values} />
            <Stack direction="row" spacing={2}>
                <Button sx={{ width: '224px' }} variant="rounded" color="secondary">
                    {t.wallets_import_wallet_cancel()}
                </Button>
                <Button
                    sx={{ width: '224px' }}
                    variant="rounded"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={some(values, (value) => !value)}>
                    {t.wallets_import_wallet_import()}
                </Button>
            </Stack>
            <Container sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_identity_warning()} />
            </Container>
        </>
    )
}
