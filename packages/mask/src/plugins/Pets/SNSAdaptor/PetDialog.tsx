import { useEffect, useState } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared-evm'
import { Button, TextField, Typography, DialogContent, Grid, MenuItem } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { PluginPetMessages } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { TWITTER } from '../constants'
import PreviewBox from './components/previewBox'

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
    thumbnail: {
        width: '25px',
        height: '25px',
        objectFit: 'cover',
        margin: theme.spacing(0, 1, 0, 0),
        display: 'inline-block',
        borderRadius: '4px',
    },
    itemFix: {
        display: 'flex',
        alignItems: 'center',
    },
    prevBox: {
        margin: theme.spacing(2, 0, 0),
        border: '1px dashed #ccc',
        borderRadius: '4px',
        height: 'calc(100% - 16px)',
        boxSizing: 'border-box',
        padding: '4px',
    },
}))

export function PetDialog() {
    const classes = useStylesExtends(useStyles(), {})
    const account = useAccount()
    const myPersonas = useMyPersonas()
    // const [input, setInput] = useState('')
    const [collectionsValue, setCollectionsValue] = useState<string>()
    const [imageValue, setImageValue] = useState<string>()
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
        // if (!input) return
        // await PluginPetRPC.saveEssay(user.address, input, user.userId)
        closeDialog()

        // if(wordResult && wordResult.userId) {
        // }
    }

    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated, (ev) => {
        // if (ev?.traderProps) setTraderProps(ev.traderProps)
        console.log('ev', ev)
    })

    return (
        <InjectedDialog open={open} onClose={closeDialog} title="Set up your NFT pet">
            <DialogContent>
                <Typography className={classes.des}>Can customize pet image and language</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <PreviewBox className={classes.prevBox} />
                    </Grid>
                    <Grid item xs={8}>
                        <TextField
                            className={classes.input}
                            label="Collections"
                            fullWidth
                            select
                            required
                            value={collectionsValue}
                            variant="outlined"
                            onChange={(e) => setCollectionsValue(e.target.value)}>
                            <MenuItem key="Traveloggers" value="Traveloggers">
                                Traveloggers
                            </MenuItem>
                            <MenuItem key="MIRROR" value="MIRROR">
                                MIRROR
                            </MenuItem>
                        </TextField>
                        <TextField
                            className={classes.input}
                            label="Image"
                            fullWidth
                            select
                            required
                            value={imageValue}
                            variant="outlined"
                            disabled={!collectionsValue}
                            maxRows={2}
                            onChange={(e) => setImageValue(e.target.value)}>
                            <MenuItem key="#1728" value="#1728">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                            <MenuItem key="#1729" value="#1729">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                            <MenuItem key="#1730" value="#1730">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                            <MenuItem key="#1731" value="#1731">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                            <MenuItem key="#1732" value="#1732">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                            <MenuItem key="#1733" value="#1733">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                            <MenuItem key="#1734" value="#1734">
                                <Typography className={classes.itemFix}>
                                    <img
                                        className={classes.thumbnail}
                                        src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                    />
                                    Baby Unifairy #1728
                                </Typography>
                            </MenuItem>
                        </TextField>
                        <TextField
                            className={classes.input}
                            label="Pet preset copy (Optional)"
                            fullWidth
                            multiline
                            rows={3}
                            disabled={!collectionsValue}
                        />
                    </Grid>
                </Grid>

                <Button className={classes.btn} variant="contained" size="large" fullWidth onClick={saveHandle}>
                    Confirm Add
                </Button>
                <Typography className={classes.des}>Support By: Mask</Typography>
            </DialogContent>
        </InjectedDialog>
    )
}
