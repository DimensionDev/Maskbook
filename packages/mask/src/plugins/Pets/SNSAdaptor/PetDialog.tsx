import { useEffect, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared-evm'
import { Button, TextField, Typography, DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { PluginPetMessages, PluginPetRPC } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { TWITTER } from '../constants'

const useStyles = makeStyles()((theme) => ({
    des: {
        paddingBottom: '-12px',
        color: '#7b8192',
        fontSize: '12px',
    },
    input: {
        margin: theme.spacing(2, 0, 0),
    },
    btn: {
        margin: theme.spacing(4, 0),
    },
}))

export function PetDialog() {
    const classes = useStylesExtends(useStyles(), {})
    const account = useAccount()
    const myPersonas = useMyPersonas()
    const [input, setInput] = useState('')
    const [user, setUser] = useState<{ userId: string; address: string }>({
        userId: '',
        address: '',
    })

    useEffect(() => {
        myPersonas.forEach((persona) => {
            const identifiers: Array<string> = []
            ;[...persona.linkedProfiles].forEach(([key]) => {
                if (key.network === TWITTER) {
                    identifiers.push(key.userId)
                }
            })
            if (identifiers.length) setUser({ userId: identifiers[0], address: account })
        })
    }, [JSON.stringify(myPersonas)])

    const saveHandle = async () => {
        if (!input) return
        await PluginPetRPC.saveEssay(user.address, input, user.userId)
        closeDialog()

        // if(wordResult && wordResult.userId) {
        // }
    }

    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated, (ev) => {
        // if (ev?.traderProps) setTraderProps(ev.traderProps)
        console.log('ev', ev)
    })

    return (
        <InjectedDialog open={open} onClose={closeDialog} title="Web 3 Companion">
            <DialogContent>
                <Typography className={classes.des}>non fungible friend</Typography>
                <TextField
                    className={classes.input}
                    label="pet preset copy"
                    fullWidth
                    required
                    type="text"
                    value={input}
                    variant="outlined"
                    onChange={(e) => setInput(e.target.value)}
                />

                <Button className={classes.btn} variant="contained" size="large" fullWidth onClick={saveHandle}>
                    Confirm Add
                </Button>
                <Typography className={classes.des}>Support By: Mask</Typography>
            </DialogContent>
        </InjectedDialog>
    )
}
