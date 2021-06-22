import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@material-ui/core'
import { useSnackbarCallback } from '@dimensiondev/maskbook-theme'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import {
    ImportWalletUI,
    RecoverResult,
    importWallet,
    TabIndexMap,
    TabIndex,
    BLANK_WORDS,
} from '../../../../maskbook/src/plugins/Wallet/UI/ImportWalletDialog'

const Container = styled('div')`
    width: 528px;
`
export function ImportWallet() {
    const [name, setName] = useState('')
    const [words, setWords] = useState<string[]>(BLANK_WORDS)
    const [walletFromPrivateKey, setWalletFromPrivateKey] = useState<Partial<RecoverResult>>({})
    const navigate = useNavigate()
    const tabState = useState(0)
    const importMode = TabIndexMap[tabState[0] as TabIndex]

    const handleImport = useSnackbarCallback(
        async () => {
            await importWallet({
                mode: importMode,
                name,
                words,
                privateKey: walletFromPrivateKey,
            })
        },
        [importMode, name, words, walletFromPrivateKey.privateKeyValid, walletFromPrivateKey.privateKey],
        () => {
            navigate('/wallets')
        },
    )
    return (
        <Container>
            <ImportWalletUI
                name={name}
                onNameChange={setName}
                words={words}
                onWordsChange={setWords}
                onRecover={setWalletFromPrivateKey}
                tabState={tabState}
            />
            <Button onClick={handleImport}>Import</Button>
        </Container>
    )
}
