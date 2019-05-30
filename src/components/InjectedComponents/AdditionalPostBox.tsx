import * as React from 'react'
import { useAsync } from '../../utils/components/AsyncComponent'
import { Person } from '../../extension/background-script/PeopleService'
import { usePeople } from '../DataSource/PeopleRef'
import { SelectPeopleUI } from './SelectPeople'
import { myUsername, getUsername } from '../../extension/content-script/injections/LiveSelectors'
import { useRef } from 'react'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { Avatar } from '../../utils/components/Avatar'
import Services from '../../extension/service'
import { pasteIntoPostBox } from '../../extension/content-script/tasks'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Card, CardHeader, Typography, Divider, Paper, InputBase, Button, Box } from '@material-ui/core'

interface Props {
    people: Person[]
    myself?: Person
    onRequestPost(people: Person[], text: string): void
}
const useStyles = makeStyles({
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
})
export function AdditionalPostBoxUI(props: Props) {
    const classes = useStyles()
    const { people, myself } = props
    const [text, setText] = React.useState('')
    const [selectedPeople, selectPeople] = React.useState<Person[]>([])

    const inputRef = useRef<HTMLInputElement>()
    useCapturedInput(inputRef, setText)
    return (
        <Card className={classes.root}>
            <CardHeader title={<Typography variant="caption">Encrypt with Maskbook</Typography>} />
            <Divider />
            <Paper elevation={0} className={classes.paper}>
                {myself && <Avatar className={classes.avatar} person={myself} />}
                <InputBase
                    classes={{ root: classes.input, input: classes.innerInput }}
                    // Todo: Test if this is break after @material/ui^4
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    placeholder={geti18nString(
                        myself && myself.nickname
                            ? 'additional_post_box__placeholder_w_name'
                            : 'additional_post_box__placeholder_wo_name',
                        myself ? myself.nickname : '',
                    )}
                />
            </Paper>
            <Divider />
            <Paper elevation={2}>
                <SelectPeopleUI
                    people={people.filter(x => x.username !== (myself ? myself.username : ''))}
                    onSetSelected={selectPeople}
                    selected={selectedPeople}
                />
            </Paper>
            <Divider />
            <Box display="flex" className={classes.grayArea}>
                <Button
                    onClick={() => props.onRequestPost(selectedPeople, text)}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!(selectedPeople.length && text)}>
                    {geti18nString('additional_post_box__post_button')}
                </Button>
            </Box>
        </Card>
    )
}

export function AdditionalPostBox() {
    const [avatar, setAvatar] = React.useState<string | undefined>('')
    let nickname
    {
        const link = myUsername.evaluateOnce()[0]
        if (link) nickname = link.innerText
    }
    const username = getUsername()
    useAsync(() => Services.People.queryAvatar(username || ''), []).then(setAvatar)
    const onRequestPost = React.useCallback(async (people, text) => {
        const [encrypted, token] = await Services.Crypto.encryptTo(text, people)
        const fullPost = geti18nString('additional_post_box__encrypted_post_pre', encrypted)
        pasteIntoPostBox(fullPost, geti18nString('additional_post_box__encrypted_failed'))
        Services.Crypto.publishPostAESKey(token)
    }, [])
    if (!username) {
        return <AdditionalPostBoxUI people={usePeople()} onRequestPost={onRequestPost} />
    }
    return (
        <AdditionalPostBoxUI
            people={usePeople()}
            myself={{ avatar, nickname, username }}
            onRequestPost={onRequestPost}
        />
    )
}
