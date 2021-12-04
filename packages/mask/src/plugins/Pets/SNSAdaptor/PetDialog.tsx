import { useEffect, useState, useMemo } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useAccount } from '@masknet/web3-shared-evm'
import { Button, TextField, Typography, DialogContent, Grid, MenuItem, Snackbar } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { PluginPetMessages } from '../messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { TWITTER } from '../constants'
import PreviewBox from './previewBox'

const useStyles = makeStyles()((theme) => ({
    desBox: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    des: {
        paddingBottom: '-12px',
        color: '#7b8192',
        fontSize: '12px !important',
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

const selectMock = [
    {
        value: '1728',
        label: 'Baby Unifairy #1728',
        url: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format',
    },
    {
        value: '1729',
        label: 'Baby Unifairy #1728',
        url: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format',
    },
    {
        value: '1730',
        label: 'Baby Unifairy #1728',
        url: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format',
    },
    {
        value: '1731',
        label: 'Baby Unifairy #1728',
        url: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format',
    },
    {
        value: '1732',
        label: 'Baby Unifairy #1728',
        url: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format',
    },
]
export function PetDialog() {
    const classes = useStylesExtends(useStyles(), {})
    const account = useAccount()
    const myPersonas = useMyPersonas()
    // const [input, setInput] = useState('')

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
        if (!collectionsValue) {
            setCollectionsError(true)
            return
        }

        if (!imageValue) {
            setImageError(true)
            return
        }

        setTipShow(true)
        closeDialog()
        setTimeout(() => {
            setTipShow(false)
        }, 2000)
        // if(wordResult && wordResult.userId) {
        // }
    }

    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated, (ev) => {
        // if (ev?.traderProps) setTraderProps(ev.traderProps)
        console.log('ev', ev)
    })

    const [collectionsValue, setCollectionsValue] = useState<string>()
    const [isCollectionsError, setCollectionsError] = useState(false)
    const onCollectionsChage = (v: string) => {
        setCollectionsValue(v)
        setCollectionsError(false)
    }

    const [imageValue, setImageValue] = useState<string>()
    const [isImageError, setImageError] = useState(false)
    const onImageChange = (v: string) => {
        setImageValue(v)
        setImageError(false)
    }

    const [msgValue, setMsgValue] = useState<string>()
    const setMsgValueCheck = (v: string) => {
        if (v.length > 20) {
            return
        }
        setMsgValue(v)
    }

    const imageChose = useMemo(() => {
        const imageChosed = selectMock.find((item) => item.value === imageValue)
        return imageChosed?.url
    }, [imageValue])

    const [isTipShow, setTipShow] = useState(false)

    return (
        <>
            <InjectedDialog open={open} onClose={closeDialog} title="Set up your NFT pet">
                <DialogContent>
                    <Typography className={classes.des}>Can customize pet image and language</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <PreviewBox message={msgValue} imageUrl={imageChose} />
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                className={classes.input}
                                label="Collections"
                                fullWidth
                                select
                                required
                                value={collectionsValue}
                                error={isCollectionsError}
                                variant="outlined"
                                onChange={(e) => onCollectionsChage(e.target.value)}>
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
                                error={isImageError}
                                variant="outlined"
                                disabled={!collectionsValue}
                                maxRows={2}
                                onChange={(e) => onImageChange(e.target.value)}>
                                {selectMock.map((item, index) => {
                                    return (
                                        <MenuItem key={item.value} value={item.value}>
                                            <Typography className={classes.itemFix}>
                                                <img
                                                    className={classes.thumbnail}
                                                    src="https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=164&h=164&fit=crop&auto=format"
                                                />
                                                {item.label}
                                            </Typography>
                                        </MenuItem>
                                    )
                                })}
                            </TextField>
                            <TextField
                                className={classes.input}
                                label="Pet preset copy (Optional)"
                                fullWidth
                                multiline
                                rows={3}
                                disabled={!collectionsValue}
                                value={msgValue}
                                onChange={(e) => setMsgValueCheck(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Button className={classes.btn} variant="contained" size="large" fullWidth onClick={saveHandle}>
                        Confirm Add
                    </Button>
                    <Typography className={classes.desBox}>
                        <Typography className={classes.des}>Support By: Mask</Typography>
                        <Typography className={classes.des}>RSS3</Typography>
                    </Typography>
                </DialogContent>
            </InjectedDialog>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={isTipShow}
                message="Your new pet has been successFully set up"
            />
        </>
    )
}
