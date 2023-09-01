import { memo, useCallback, useState } from 'react'
import { DesktopMnemonicConfirm } from '../../../components/Mnemonic/DesktopMnemonicConfirm.js'
import { useList } from 'react-use'

export const Mnemonic = memo(function Mnemonic() {
    const [values, { updateAt, set: setMnemonic }] = useList(Array.from({ length: 12 }, () => ''))
    const [error, setError] = useState('')

    const handleWordChange = useCallback((word: string, index: number) => {
        updateAt(index, word)
        setError('')
    }, [])

    return <DesktopMnemonicConfirm onChange={handleWordChange} puzzleWords={values} setAll={setMnemonic} />
})
