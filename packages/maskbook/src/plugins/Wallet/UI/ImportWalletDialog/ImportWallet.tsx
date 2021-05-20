import { FC, useState } from 'react'
import { Box, TextField, DialogContent, makeStyles } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { MnemonicTab } from './MnemonicTab'
import { FromJson } from './FromJson'
import { FromPrivateKey } from './FromPrivateKey'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(4, 5, 1),
    },
    walletName: {
        width: '100%',
    },
    textField: {
        width: '100%',
        minHeight: 97,
    },
    dialogActions: {
        alignItems: 'center',
        padding: theme.spacing(3, 5),
    },
    actionButton: {
        backgroundColor: '#1C68F3',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
    },
}))

const BLANK_WORDS = Array.from({ length: 12 }).fill('') as string[]

export interface ImportWalletProps {}

export const ImportWallet: FC<ImportWalletProps> = () => {
    const classes = useStyles()
    const [words, setWords] = useState<string[]>(BLANK_WORDS)
    const tabState = useState(0)
    const [privateKey, setPrivateKey] = useState('')
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
            children: <FromPrivateKey value={privateKey} onChange={setPrivateKey} />,
        },
    ]
    return (
        <>
            <DialogContent className={classes.content}>
                <Box>
                    <TextField
                        className={classes.walletName}
                        inputProps={{
                            maxLength: 12,
                        }}
                        label="Wallet Name"
                        placeholder="Enter 1-12 characters"
                    />
                    <AbstractTab tabs={tabs} state={tabState} />
                </Box>
            </DialogContent>
        </>
    )
}
