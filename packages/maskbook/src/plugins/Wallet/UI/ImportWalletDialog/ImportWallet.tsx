import { FC, useState } from 'react'
import { Box, TextField, makeStyles } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { MnemonicTab } from './MnemonicTab'
import { FromJson } from './FromJson'

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        minHeight: 97,
    },
}))

const BLANK_WORDS = Array.from({ length: 12 }).fill('') as string[]

export interface ImportWalletProps {}

export const ImportWallet: FC<ImportWalletProps> = () => {
    const classes = useStyles()
    const [words, setWords] = useState<string[]>(BLANK_WORDS)
    const tabState = useState(0)
    const tabs: AbstractTabProps['tabs'] = [
        {
            label: 'Mnemonic',
            children: <MnemonicTab words={words} onChange={setWords} />,
        },
        {
            label: 'Json File',
            children: <FromJson />,
        },
        {
            label: 'Private Key',
            children: (
                <Box>
                    <TextField className={classes.textField} multiline placeholder="Input your private key" />
                </Box>
            ),
        },
    ]
    return (
        <Box>
            <AbstractTab tabs={tabs} state={tabState}></AbstractTab>
        </Box>
    )
}
