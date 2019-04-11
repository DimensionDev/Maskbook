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
import { useAsync } from '../../utils/AsyncComponent'
import { CryptoService, PeopleService } from '../../extension/content-script/rpc'
import { Person } from '../../extension/background-script/PeopleService'
import { usePeople } from '../DataSource/PeopleRef'
import { SelectPeopleUI } from './SelectPeople'
import { CustomPasteEventId } from '../../utils/Names'
import { sleep } from '../../utils/utils'
import { myUsername, getUsername } from '../../extension/content-script/injections/LiveSelectors'

interface Props {
    avatar?: string
    nickname?: string
    username?: string
    encrypted: string
    onCombinationChange(people: Person[], text: string): void
    onRequestPost(text: string): void
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
    innerInput: {
        minHeight: '3em',
    },
    // todo: theme
    grayArea: { background: '#f5f6f7', padding: 8, wordBreak: 'break-all' },
    typo: { lineHeight: '28.5px' },
    button: { padding: '2px 30px' },
})<Props>(props => {
    const { classes } = props
    const [text, setText] = React.useState('')
    const [selectedPeople, selectPeople] = React.useState<Person[]>([])
    const encrypted = `Decrypt this post with ${props.encrypted}`

    const people = usePeople()
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
                    classes={{ root: classes.input, input: classes.innerInput }}
                    value={text}
                    onChange={e => {
                        setText(e.currentTarget.value)
                        props.onCombinationChange(selectedPeople, e.currentTarget.value)
                    }}
                    fullWidth
                    multiline
                    placeholder={`${
                        props.nickname ? `Hey ${props.nickname}, w` : 'W'
                    }hat's your mind? Encrypt with Maskbook`}
                />
            </Paper>
            <Divider />
            <SelectPeopleUI
                all={people.filter(x => x.username !== props.username)}
                onSetSelected={p => {
                    selectPeople(p)
                    props.onCombinationChange(p, text)
                }}
                selected={selectedPeople}
            />
            <Divider />
            <FlexBox className={classes.grayArea}>
                <Typography className={classes.typo} variant="caption">
                    Encrypted Text Preview
                </Typography>
                <FullWidth />
                <Button
                    onClick={() => props.onRequestPost(encrypted)}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!(selectedPeople.length && text)}>
                    📫 Post it!
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
function selectElementContents(el: Node) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
}

export function AdditionalPostBox() {
    const [text, setText] = React.useState('')
    const [people, setPeople] = React.useState<Person[]>([])
    const [encrypted, setEncrypted] = React.useState<string | undefined>('')
    const publisherToken = React.useRef<string>()
    const [avatar, setAvatar] = React.useState<string | undefined>('')
    useAsync(() => CryptoService.encryptTo(text, people), [text, people]).then(data => {
        const [str, pub] = data
        setEncrypted(str)
        publisherToken.current = pub
    })
    let nickname
    {
        const link = myUsername.evaluateOnce()[0]
        if (link) nickname = link.innerText
    }
    const username = getUsername()
    useAsync(() => PeopleService.queryAvatar(username || ''), []).then(setAvatar)
    return (
        <AdditionalPostBoxUI
            avatar={avatar}
            nickname={nickname}
            username={username}
            onRequestPost={async text => {
                if (!publisherToken.current) return
                const element = document.querySelector<HTMLDivElement>('.notranslate')!
                element.focus()
                await sleep(100)
                selectElementContents(element)
                await sleep(100)
                document.dispatchEvent(new CustomEvent(CustomPasteEventId, { detail: text }))
                navigator.clipboard.writeText(text)
                // Prevent Custom Paste failed, this will cause service not available to user.
                CryptoService.publishPostAESKey(publisherToken.current)
            }}
            encrypted={publisherToken.current ? encrypted || '' : ''}
            onCombinationChange={(p, t) => {
                if (p !== people) setPeople(p)
                if (t !== text) setText(t)
            }}
        />
    )
}
