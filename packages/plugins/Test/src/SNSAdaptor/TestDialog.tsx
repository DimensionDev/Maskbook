import { MaskDialog } from '../../../../theme/src/Components'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { ChangeEvent, useCallback, useState } from 'react'
import { TextField, Button } from '@mui/material'
import { useContract, useAccount } from '@masknet/web3-shared-evm'
import ENSABI from '@masknet/web3-contracts/abis/ENS.json'
import { useI18N } from '../locales/index'
import ENSDetail from './ENSDetail'

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

interface CreateParams {
    gas: number | undefined
    params: MethodParameters
    paramsObj: ParamsObjType
    gasError: Error | null
}

const TestDialog: React.FC<TestDialogProps> = (props) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [ensName, setEnsName] = useState('')
    const account = useAccount()

    const contract = useContract('0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41', ENSABI)

    const getCreateParams = useCallback(async (): Promise<CreateParams | null> => {
        const gas = await contract.methods
            .create_red_packet(...params)
            .estimateGas({ from: account, value })
            .catch((error: Error) => {
                gasError = error
            })

        return { gas: gas as number | undefined, params, paramsObj, gasError }
    }, [redPacketSettings, account, redPacketContract])

    const handleEnsNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const ens_ = ev.currentTarget.value
        setEnsName(ens_)
    }, [])

    const handleSearch = useCallback(async () => {
        const k = await contract?.methods.available(ensName).call({ from: account })
        // const m = await k.send()
        console.log(k)
    }, [ensName])

    const handleBuy = useCallback(async () => {
        console.log(ensName)
    }, [ensName])
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
                    label={t('ens')}
                    value={ensName}
                    onChange={handleEnsNameChange}
                />
                <section>
                    <Button className={classes.button} variant="contained" size="small" onClick={handleSearch}>
                        {t('search')}
                    </Button>
                </section>
            </Box>
            <ENSDetail ensInfo="kk" />
            <section>
                <Button className={classes.button} variant="contained" size="small" onClick={handleBuy}>
                    {t('buy')}
                </Button>
            </section>
        </MaskDialog>
    )
}

export default TestDialog
