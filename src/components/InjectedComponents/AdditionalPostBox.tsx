import * as React from 'react'
import Card from '@material-ui/core/Card/Card'
import CardHeader from '@material-ui/core/CardHeader/CardHeader'
import Typography from '@material-ui/core/Typography/Typography'
import Paper from '@material-ui/core/Paper/Paper'
import InputBase from '@material-ui/core/InputBase/InputBase'
import Avatar from '@material-ui/core/Avatar/Avatar'
import Divider from '@material-ui/core/Divider/Divider'
import { FlexBox, FullWidth } from '../../utils/Flex'
import Button from '@material-ui/core/Button/Button'
import { withStylesTyped, MaskbookLightTheme } from '../../utils/theme'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { KeysProvider, KeysConsumer } from '../../key-management/keys'
import { SelectPeopleSingle } from './SelectPeopleSingle'
import { PersonCryptoKey, getMyPrivateKey } from '../../key-management/db'
import { useAsync } from '../../utils/AsyncComponent'
import { encryptText } from '../../crypto/crypto'

interface Props {
    avatar?: string
    encrypted: string
    onCombinationChange(person: PersonCryptoKey, text: string): void
}
const _AdditionalPostBox = withStylesTyped({
    root: { maxWidth: 500, marginBottom: 10 },
    paper: { borderRadius: 0, display: 'flex' },
    avatar: { margin: '12px 0 0 12px' },
    input: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
    },
    // todo: theme
    grayArea: { background: '#f5f6f7', padding: 8, wordBreak: 'break-all' },
    typo: { lineHeight: '28.5px' },
    button: { padding: '2px 30px' },
})<Props>(props => {
    const { classes } = props
    const [text, setText] = React.useState('')
    const [people, setPeople] = React.useState<PersonCryptoKey>({} as any)
    const encrypted = `Decrypt this post with maskbook://${props.encrypted}`
    return (
        <Card className={classes.root}>
            <CardHeader title={<Typography variant="caption">Encrypt with Maskbook</Typography>} />
            <Divider />
            <Paper elevation={0} className={classes.paper}>
                {props.avatar ? (
                    props.avatar.length > 3 ? (
                        <Avatar className={classes.avatar} src={props.avatar} />
                    ) : (
                        <Avatar className={classes.avatar} children={props.avatar} />
                    )
                ) : (
                    undefined
                )}
                <InputBase
                    className={classes.input}
                    value={text}
                    onChange={e => {
                        setText(e.currentTarget.value)
                        props.onCombinationChange(people, e.currentTarget.value)
                    }}
                    fullWidth
                    multiline
                    placeholder="What's your mind? Encrypt with Maskbook"
                />
            </Paper>
            <Divider />
            <KeysProvider>
                <KeysConsumer>
                    {k => (
                        <SelectPeopleSingle
                            all={k}
                            onSelect={p => {
                                const q = k.find(x => x.username === p.username)!
                                setPeople(q)
                                props.onCombinationChange(q, text)
                            }}
                            selected={people}
                        />
                    )}
                </KeysConsumer>
            </KeysProvider>
            <Divider />
            <FlexBox className={classes.grayArea}>
                <Typography className={classes.typo} variant="caption">
                    Encrypted Text Preview
                </Typography>
                <FullWidth />
                <Button
                    onClick={() => (navigator as any).clipboard.writeText(encrypted)}
                    variant="contained"
                    color="primary"
                    className={classes.button}>
                    Copy Encrypted Text
                </Button>
            </FlexBox>
            <FlexBox className={classes.grayArea}>
                <Typography variant="caption">{encrypted}</Typography>
            </FlexBox>
        </Card>
    )
})
export function AdditionalPostBoxUI(props: Props) {
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            <_AdditionalPostBox {...props} />
        </MuiThemeProvider>
    )
}

const enum VERSION {
    PreAlpha0 = -42,
}
async function encrypt(people: PersonCryptoKey | null, text: string) {
    if (!people) return undefined
    const myPrivate = (await getMyPrivateKey())!.key.privateKey!
    const { encryptedText, salt, signature } = await encryptText(text, myPrivate, people.key.publicKey!)
    return VERSION.PreAlpha0 + '|' + people.username + '|' + salt + '|' + encryptedText + '|' + signature
}
export function AdditionalPostBox() {
    const [text, setText] = React.useState('')
    const [people, setPeople] = React.useState<PersonCryptoKey | null>(null)
    const [encrypted, setEncrypted] = React.useState<string | undefined>('')
    useAsync(() => encrypt(people, text), [text, people]).then(setEncrypted)
    return (
        <AdditionalPostBoxUI
            encrypted={encrypted || ''}
            onCombinationChange={(p, t) => {
                if (p !== people) setPeople(p)
                if (t !== text) setText(t)
            }}
        />
    )
}
