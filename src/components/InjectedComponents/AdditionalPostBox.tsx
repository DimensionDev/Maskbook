import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { SelectPeopleUI } from '../shared/SelectPeople'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { Avatar } from '../../utils/components/Avatar'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Box, Button, Card, CardHeader, Divider, InputBase, Paper, Typography } from '@material-ui/core'
import { Person } from '../../database'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { useCurrentIdentity, useFriendsList, useMyIdentities } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { ChooseIdentity } from '../shared/ChooseIdentity'

interface Props {
    people: Person[]
    onRequestPost(people: Person[], text: string): void
}
const useStyles = makeStyles({
    root: { margin: '10px 0' },
    header: { padding: '8px 12px 0' },
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
    const { people } = props
    const classes = useStyles()

    const myself = useCurrentIdentity()
    const [text, setText] = useState('')
    const [selectedPeople, selectPeople] = useState<Person[]>(props.people)

    const inputRef = useRef<HTMLInputElement>()
    useCapturedInput(inputRef, setText)
    return (
        <Card className={classes.root}>
            <CardHeader
                classes={{ root: classes.header }}
                title={<Typography variant="caption">Maskbook</Typography>}
            />
            <Paper elevation={0} className={classes.paper}>
                {myself && <Avatar className={classes.avatar} person={myself} />}
                <InputBase
                    classes={{ root: classes.input, input: classes.innerInput }}
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
                <SelectPeopleUI ignoreMyself people={people} onSetSelected={selectPeople} selected={selectedPeople} />
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

export function AdditionalPostBox(props: Partial<Props>) {
    const people = useFriendsList()
    const identity = useMyIdentities()

    const onRequestPost = useCallback(
        async (people: Person[], text: string) => {
            const [encrypted, token] = await Services.Crypto.encryptTo(
                text,
                people.map(x => x.identifier),
                identity[0].identifier,
            )
            const fullPost = geti18nString('additional_post_box__encrypted_post_pre', encrypted)
            getActivatedUI().taskPasteIntoPostBox(fullPost, {
                warningText: geti18nString('additional_post_box__encrypted_failed'),
                shouldOpenPostDialog: false,
            })
            Services.Crypto.publishPostAESKey(token, identity[0].identifier)
        },
        [identity],
    )

    if (identity.length === 0) {
        return <NotSetupYetPrompt />
    }

    const ui = <AdditionalPostBoxUI people={people} onRequestPost={onRequestPost} {...props} />

    if (identity.length > 1)
        return (
            <>
                <ChooseIdentity />
                {ui}
            </>
        )
    return ui
}
