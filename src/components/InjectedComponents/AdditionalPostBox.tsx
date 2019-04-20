import * as React from 'react'
import Card from '@material-ui/core/Card/Card'
import CardHeader from '@material-ui/core/CardHeader/CardHeader'
import Typography from '@material-ui/core/Typography/Typography'
import Paper from '@material-ui/core/Paper/Paper'
import InputBase from '@material-ui/core/InputBase/InputBase'
import Avatar from '@material-ui/core/Avatar/Avatar'
import Divider from '@material-ui/core/Divider/Divider'
import { FlexBox } from '../../utils/Flex'
import Button from '@material-ui/core/Button/Button'
import { withStylesTyped } from '../../utils/theme'
import { useAsync } from '../../utils/AsyncComponent'
import { CryptoService, PeopleService } from '../../extension/content-script/rpc'
import { Person } from '../../extension/background-script/PeopleService'
import { usePeople } from '../DataSource/PeopleRef'
import { SelectPeopleUI } from './SelectPeople'
import { CustomPasteEventId } from '../../utils/Names'
import { sleep } from '../../utils/utils'
import { myUsername, getUsername } from '../../extension/content-script/injections/LiveSelectors'
import { useRef } from 'react'
import { useCapturedInput } from '../../utils/useCapturedEvents'

interface Props {
    people: Person[]
    avatar?: string
    nickname?: string
    username?: string
    onRequestPost(people: Person[], text: string): void
}
export const AdditionalPostBoxUI = withStylesTyped({
    root: { margin: '10px 0' },
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
    button: { padding: '2px 30px', flex: 1 },
})<Props>(props => {
    const { classes, people } = props
    const [text, setText] = React.useState('')
    const [selectedPeople, selectPeople] = React.useState<Person[]>([])

    const inputRef = useRef<HTMLInputElement>()
    useCapturedInput(inputRef, setText)
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
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    placeholder={`${
                        props.nickname ? `Hey ${props.nickname}, w` : 'W'
                    }hat's your mind? Encrypt with Maskbook`}
                />
            </Paper>
            <Divider />
            <Paper>
                <SelectPeopleUI
                    all={people.filter(x => x.username !== props.username)}
                    onSetSelected={selectPeople}
                    selected={selectedPeople}
                />
            </Paper>
            <Divider />
            <FlexBox className={classes.grayArea}>
                <Button
                    onClick={() => props.onRequestPost(selectedPeople, text)}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!(selectedPeople.length && text)}>
                    📫 Post it!
                </Button>
            </FlexBox>
        </Card>
    )
})

function selectElementContents(el: Node) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
}
export function AdditionalPostBox() {
    const [avatar, setAvatar] = React.useState<string | undefined>('')
    let nickname
    {
        const link = myUsername.evaluateOnce()[0]
        if (link) nickname = link.innerText
    }
    const username = getUsername()
    useAsync(() => PeopleService.queryAvatar(username || ''), []).then(setAvatar)
    const onRequestPost = React.useCallback(async (people, text) => {
        const [encrypted, token] = await CryptoService.encryptTo(text, people)
        const fullPost = 'Decrypt this post with ' + encrypted
        const element = document.querySelector<HTMLDivElement>('.notranslate')!
        element.focus()
        await sleep(100)
        selectElementContents(element)
        await sleep(100)
        document.dispatchEvent(new CustomEvent(CustomPasteEventId, { detail: fullPost }))
        navigator.clipboard.writeText(fullPost)
        // Prevent Custom Paste failed, this will cause service not available to user.
        CryptoService.publishPostAESKey(token)
    }, [])
    return (
        <AdditionalPostBoxUI
            people={usePeople()}
            avatar={avatar}
            nickname={nickname}
            username={username}
            onRequestPost={onRequestPost}
        />
    )
}
