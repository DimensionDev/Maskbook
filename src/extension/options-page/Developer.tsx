import { ListSubheader, Grid, Paper, makeStyles } from '@material-ui/core'
import { PersonIdentifier, Identifier } from '../../database/type'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../service'
import { useCurrentIdentity } from '../../components/DataSource/useActivatedUI'
import { Person } from '../../database'
import React from 'react'
import { AddProve } from './DeveloperComponents/AddProve'
import { DecryptPostDeveloperMode } from './DeveloperComponents/DecryptPost'
import { SeeMyProvePost } from './DeveloperComponents/SeeMyProvePost'
import { FriendsDeveloperMode } from './DeveloperComponents/Friends'

async function swallowGoo(me: Person | null) {
    const boxElem = document.querySelector('#raw-box') as HTMLTextAreaElement
    const content = boxElem.value as string
    boxElem.value = await assimilateGoo(content, me)
}

async function assimilateGoo(content: string, me: Person | null): Promise<string> {
    if (content.includes('🔒|')) {
        const [bio, id] = content.split('|')
        const result = await Services.Crypto.verifyOthersProve(bio, Identifier.fromString(
            newFunction() + id,
        ) as PersonIdentifier)
        return result ? '✔' + id : '❌' + content
    } else if (content.includes('🎼')) {
        // TODO: actually use the UI thing because we want to be able to *drumroll* add receipients
        try {
            const [, by] = content.split(':||')
            const pl = deconstructPayload(content, true)!
            const r = await Services.Crypto.decryptFrom(
                pl.encryptedText,
                Identifier.fromString('person:' + by) as PersonIdentifier,
                me ? me.identifier : PersonIdentifier.unknown,
            )
            if ('error' in r) {
                throw Error(r.error)
            } else {
                return r.content + '\n' + r.signatureVerifyResult ? '✔' : '❌'
            }
        } catch (e) {
            return e.message + '\n' + content
        }
    }
    return content

    function newFunction() {
        return 'person:'
    }
}
const useStyles = makeStyles(theme => ({ root: { padding: theme.spacing(0, 2) } }))
const DevPage = () => {
    // const me = useCurrentIdentity(false)
    const classes = useStyles()
    return (
        <>
            <ListSubheader>Developer Settings</ListSubheader>
            <div className={classes.root}>
                <Grid container spacing={2}>
                    <Grid container xs={6} item spacing={2} direction="column">
                        <Grid item>
                            <SeeMyProvePost />
                        </Grid>
                        <Grid item>
                            <AddProve />
                        </Grid>
                        <Grid item>
                            <DecryptPostDeveloperMode />
                        </Grid>
                    </Grid>
                    <Grid container xs={6} item spacing={2} direction="column">
                        <Grid item>
                            <FriendsDeveloperMode />
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default DevPage
