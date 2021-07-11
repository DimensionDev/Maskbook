import { DesktopMnemonicConfirm } from '../Mnemonic'
import { Services } from '../../API'
import { useList } from 'react-use'
import { Button } from '@material-ui/core'
import { ControlContainer } from './index'
import { useDashboardI18N } from '../../locales'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { some } from 'lodash-es'

export const RestoreFromMnemonic = () => {
    const t = useDashboardI18N()
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
            <ControlContainer>
                <Button color="secondary">{t.wallets_import_wallet_cancel()}</Button>
                <Button color="primary" onClick={handleSubmit} disabled={some(values, (value) => !value)}>
                    {t.wallets_import_wallet_import()}
                </Button>
            </ControlContainer>
        </>
    )
}
