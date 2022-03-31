import { makeStyles } from '@masknet/theme'
import { Box, DialogContent, Typography } from '@mui/material'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { PersonaItem } from './PersonaItem'
import { CloseIcon } from '../assets/close'
import { useState } from 'react'
import { NFTListDialog } from './NFTListDialog'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { activatedSocialNetworkUI } from '../../../social-network'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useAddressNames } from '@masknet/web3-shared-evm'
import { useNextIDBoundByPlatform } from '../../../components/DataSource/useNextID'
import { queryExistedBindingByPersona } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'

const useStyles = makeStyles()((theme) => ({
    root: {},
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 8,
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        fontSize: 14,
        alignItems: 'center',
    },
}))

interface NFTAvatarsDialogProps extends withClasses<never> {
    open: boolean
    onClose: () => void
}

export function NFTAvatarDialog(props: NFTAvatarsDialogProps) {
    const { classes } = useStyles()
    const personas = useMyPersonas()
    const currentIdentity = useLastRecognizedIdentity()
    const [visible, setVisible] = useState(true)
    const [open, setOpen] = useState(false)

    const identity = useCurrentVisitingIdentity()
    const currentConnectedPersona = usePersonaConnectStatus()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: addressNames = EMPTY_LIST, loading: loadingAddressNames } = useAddressNames(identity)
    const { value: personaList = EMPTY_LIST, loading: loadingPersonaList } = useNextIDBoundByPlatform(
        platform as NextIDPlatform,
        identity.identifier.userId,
    )
    const isOwner = currentIdentity.identifier.toText() === identity.identifier.toText()

    console.log('-----------------------')
    console.log(personaList)
    console.log(addressNames)
    console.log(personas)
    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!currentIdentity) return
        console.log('aaaaaaaaaaa:', currentIdentity.identifier)
        return Services.Identity.queryPersonaByProfile(currentIdentity.identifier)
    }, [currentIdentity, currentConnectedPersona.hasPersona])
    const { value: binds } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona])

    console.log('+++++++++++++++++++++++')
    console.log(loadingPersona)
    console.log(currentPersona)
    console.log(binds)
    return (
        <>
            <InjectedDialog title="NFT PFP" open={props.open} onClose={props.onClose}>
                <DialogContent sx={{ height: 612 }}>
                    {visible ? (
                        <Box className={classes.messageBox}>
                            <Typography color="#1C68F3" variant="body1" fontSize={14}>
                                Customize NFT experience by connecting social accounts. Enjoy Web2 with a whole new Web3
                                vibe.
                            </Typography>
                            <CloseIcon onClick={() => setVisible(false)} />
                        </Box>
                    ) : null}
                    <PersonaItem
                        disabled={!isOwner}
                        avatar={currentIdentity.avatar}
                        userId={currentIdentity.identifier.userId}
                        nickname={currentIdentity.nickname}
                        onClick={() => setOpen(true)}
                    />
                </DialogContent>
            </InjectedDialog>
            <NFTListDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
