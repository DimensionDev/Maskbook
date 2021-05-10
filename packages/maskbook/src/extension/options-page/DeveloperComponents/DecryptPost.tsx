import { useMemo, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { ProfileIdentifier } from '../../../database/type'
import { useTextField } from '../../../utils/hooks/useForms'
import { DecryptPost } from '../../../components/InjectedComponents/DecryptedPost/DecryptedPost'
import { useIsolatedChooseIdentity } from '../../../components/shared/ChooseIdentity'
import { FormControlLabel, Checkbox } from '@material-ui/core'

export function DecryptPostDeveloperMode() {
    const [whoAmI, chooseIdentity] = useIsolatedChooseIdentity()
    const [postByMyself, setPostByMyself] = useState(false)
    const [author, authorInput] = useTextField('Author ID of this post', {
        required: !postByMyself,
        disabled: postByMyself,
    })
    const [encryptedText, encryptedTextInput] = useTextField('Encrypted post', {
        placeholder: '🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature|publicShared|author:||',
        required: true,
    })
    const network = whoAmI ? whoAmI.identifier.network : 'localhost'
    const authorIdentifier = useMemo(() => new ProfileIdentifier(network, author), [network, author])
    const whoAmIIdentifier = whoAmI ? whoAmI.identifier : ProfileIdentifier.unknown
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Decrypt post manually
                </Typography>
                <Typography variant="caption" gutterBottom>
                    Your identity?
                </Typography>
                {chooseIdentity}
                {/* {networkInput} */}
                <FormControlLabel
                    control={
                        <Checkbox
                            color="secondary"
                            checked={postByMyself}
                            onChange={(e) => setPostByMyself(e.target.checked)}
                        />
                    }
                    label="Post by myself"
                />
                {authorInput}
                {encryptedTextInput}
                <div style={{ minHeight: 200 }}>
                    <DecryptPost
                        alreadySelectedPreviously={[]}
                        onDecrypted={(post) => {}}
                        profiles={[]}
                        whoAmI={whoAmIIdentifier}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
