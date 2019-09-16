import {
    TextField,
    Button,
    ListItem,
    List,
    ListSubheader,
    ListItemText,
    ListItemSecondaryAction,
} from '@material-ui/core'
import { PersonIdentifier, Identifier } from '../../database/type'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import Services from '../service'
import { useCurrentIdentity } from '../../components/DataSource/useActivatedUI'
import { Person } from '../../database'
import React from 'react'

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

const DevPage = () => {
    const me = useCurrentIdentity(false)
    return (
        <List subheader={<ListSubheader>Developer Settings</ListSubheader>}>
            <ListItem>
                <ListItemText
                    primary={
                        <TextField
                            id="raw-box"
                            label="Enter prove message or encrypted payload here"
                            placeholder="🔒abc🔒|example.com/username or 🎼3/4|xyz:||example.com/username"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    }
                />
                <ListItemSecondaryAction>
                    <Button variant="contained" onClick={() => swallowGoo(me)}>
                        Assimilate
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    )
}

export default DevPage
