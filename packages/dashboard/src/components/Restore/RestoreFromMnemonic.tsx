import { useRef, useState } from 'react'
import { DesktopMnemonicConfirm } from '../Mnemonic'

export const RestoreFromMnemonic = () => {
    const [file, setFile] = useState<File | null>(null)
    const values = useRef<Readonly<Record<string, string>>>({ length: 12 as any })

    const handleOnChange = (word: string, index: number) => {
        values.current = { ...values.current, [index]: word }
    }
    return <DesktopMnemonicConfirm onChange={handleOnChange} puzzleWords={Array.from(values.current as any)} />
}
