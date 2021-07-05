import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import {
    ImportWalletUI,
    RecoverResult,
    importWallet,
    TabIndexMap,
    TabIndex,
    BLANK_WORDS,
} from '../../../../maskbook/src/plugins/Wallet/SNSAdaptor/ImportWalletDialog'

const Container = styled('div')`
    width: 528px;
    padding: 32px;
    border-radius: 20px;
    background-color: ${MaskColorVar.primaryBackground};
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
            <Button onClick={handleImport} fullWidth>
                Import
            </Button>
        </Container>
    )
}
