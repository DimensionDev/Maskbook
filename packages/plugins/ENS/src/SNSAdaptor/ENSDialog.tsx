import { MaskDialog } from '../../../../theme/src/Components'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { ChangeEvent, useCallback, useState } from 'react'
import { TextField, Button } from '@mui/material'
import { useAccount } from '@masknet/web3-shared-evm'
const { hash } = require('eth-ens-namehash')
import { useI18N } from '../locales/index'
import ENSDetail from './ENSDetail'
import type { ENS_Info_type } from './types'
import { useENSContract } from './hook/useENSContract'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: 600,
        overflow: 'scroll',
        display: 'flex',
        padding: theme.spacing(1),
    },
    input: {
        flex: 1,
        padding: theme.spacing(0.5),
    },
    button: {
        padding: theme.spacing(1, 2),
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    skeleton: {
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '48px',
    },
}))
interface TestDialogProps {
    open: boolean
    onClose: () => void
}

const TestDialog: React.FC<TestDialogProps> = (props) => {
    const { classes } = useStyles()
    const t = useI18N()
    const [ensName, setEnsName] = useState('')
    const [ENSInfo, setENSInfo] = useState<ENS_Info_type>()
    const account = useAccount()

    const contract = useENSContract()

    const handleEnsNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const ens_ = ev.currentTarget.value
        setEnsName(ens_)
    }, [])

    const handleSearch = useCallback(async () => {
        const nameHash = hash(ensName)
        const owner = await contract?.methods?.owner(nameHash)?.call({ from: account })
        const resolver = await contract?.methods?.resolver(nameHash)?.call({ from: account })
        const ttl = await contract?.methods?.ttl(nameHash)?.call({ from: account })
        setENSInfo({
            owner,
            ttl,
            resolver,
        })
    }, [ensName])
    console.log({ ENSInfo })

    return (
        <MaskDialog open={props.open} title="test" onClose={props.onClose}>
            <Box className={classes.wrapper}>
                <TextField
                    className={classes.input}
                    InputProps={{
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        },
                    }}
                    // InputLabelProps={{
                    //     shrink: true,
                    //     classes: {
                    //         shrink: classes.inputShrinkLabel,
                    //     },
                    // }}
                    label={t.ens()}
                    value={ensName}
                    onChange={handleEnsNameChange}
                />
                <section>
                    <Button className={classes.button} variant="contained" size="small" onClick={handleSearch}>
                        {t.search()}
                    </Button>
                </section>
            </Box>
            <ENSDetail ENS_Info={ENSInfo} />
        </MaskDialog>
    )
}

export default TestDialog
