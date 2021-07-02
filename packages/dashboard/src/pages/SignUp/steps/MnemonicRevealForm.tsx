import { ColumnContentLayout } from '../../../components/RegisterFrame/ColumnContentLayout'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { SignUpAccountIcon } from '@masknet/icons'
import { MnemonicReveal } from '../../../components/Mnemonic'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'
import { MaskAlert } from '../../../components/MaskAlert'

export const MnemonicRevealForm = () => {
    const navigate = useNavigate()
    const [words] = useMnemonicWordsPuzzle()
    return (
        <ColumnContentLayout
            title={'Create an Identity for Mask Network'}
            action={{ name: 'Recovery & Sign In', callback: () => navigate(RoutePaths.Login) }}>
            <SignUpAccountIcon />
            <div>
                <MnemonicReveal words={words} />
            </div>
            <div>
                <MaskAlert description={'test'} type={'info'} />
            </div>
        </ColumnContentLayout>
    )
}
