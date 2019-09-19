import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { PersonIdentifier } from '../../../database/type'
import { useTextField } from '../../../utils/components/useForms'
import { DecryptPostUI } from '../../../components/InjectedComponents/DecryptedPost'
import { Person } from '../../../database'
import { useMyIdentities } from '../../../components/DataSource/useActivatedUI'
import { ChooseIdentity } from '../../../components/shared/ChooseIdentity'

const useStyles = makeStyles(theme => ({}))

export function DecryptPostDeveloperMode() {
    const classes = useStyles()
    const myIdentities = useMyIdentities()
    const [whoAmISelected, setWhoAmI] = useState<Person | undefined>()
    // const [network, networkInput] = useTextField('Network', { defaultValue: 'facebook.com', required: true })
    const [author, authorInput] = useTextField('Author ID of this post', { required: true })
    const [encryptedText, encryptedTextInput] = useTextField('Encrypted post', {
        placeholder: '🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||',
        required: true,
    })
    const whoAmI = whoAmISelected
        ? whoAmISelected.identifier
        : myIdentities[0]
        ? myIdentities[0].identifier
        : PersonIdentifier.unknown
    const network = whoAmI.network
    const authorIdentifier = useMemo(() => new PersonIdentifier(network, author), [network, author])
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Decrypt post manually
                </Typography>
                <Typography variant="caption" gutterBottom>
                    Your identity?
                </Typography>
                <ChooseIdentity onChangeIdentity={who => setWhoAmI(who)} />
                {/* {networkInput} */}
                {authorInput}
                {encryptedTextInput}
                <DecryptPostUI.UI
                    disableSuccessDecryptionCache
                    alreadySelectedPreviously={[]}
                    requestAppendRecipients={async () => alert('Not available in this mode')}
                    encryptedText={encryptedText}
                    onDecrypted={post => {}}
                    people={[]}
                    postBy={authorIdentifier}
                    whoAmI={whoAmI}
                />
            </CardContent>
        </Card>
    )
}
