import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { SelectPeopleAndGroupsUI } from '../shared/SelectPeopleAndGroups'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { Avatar } from '../../utils/components/Avatar'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Box, Button, Card, CardHeader, Divider, InputBase, Paper, Typography } from '@material-ui/core'
import { Group, Person } from '../../database'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { useCurrentIdentity, useFriendsList, useGroupsList, useMyIdentities } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { ChooseIdentity } from '../shared/ChooseIdentity'
import { useAsync } from '../../utils/components/AsyncComponent'
import { PersonIdentifier, Identifier } from '../../database/type'
import { steganographyModeSetting } from '../shared-settings/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'

interface Props {
    availableTarget: Array<Person | Group>

    onRequestPost: (target: Array<Person | Group>, text: string) => void
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
    const classes = useStyles()

    const myself = useCurrentIdentity()
    const [text, setText] = useState('')
    const [shareTarget, changeShareTarget] = useState(props.availableTarget)

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
                <SelectPeopleAndGroupsUI
                    ignoreMyself
                    items={props.availableTarget}
                    onSetSelected={changeShareTarget}
                    selected={shareTarget}
                />
            </Paper>
            <Divider />
            <Box display="flex" className={classes.grayArea}>
                <Button
                    onClick={() => props.onRequestPost(shareTarget, text)}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!(shareTarget.length && text)}>
                    {geti18nString('additional_post_box__post_button')}
                </Button>
            </Box>
        </Card>
    )
}

export function AdditionalPostBox(props: Partial<Props>) {
    const people = useFriendsList()
    const groups = useGroupsList()
    const groupsAndPeople = React.useMemo(() => [...groups, ...people], [people, groups])
    const identities = useMyIdentities()
    const identity = useCurrentIdentity()
    const isSteganography = useValueRef(steganographyModeSetting)

    const onRequestPost = useCallback(
        async (target: (Person | Group)[], text: string) => {
            const [encrypted, token] = await Services.Crypto.encryptTo(
                text,
                target.map(x => x.identifier),
                identity!.identifier,
            )
            const activeUI = getActivatedUI()
            if (isSteganography) {
                activeUI.taskPasteIntoPostBox(geti18nString('additional_post_box__steganography_post_pre'), {
                    warningText: geti18nString('additional_post_box__encrypted_failed'),
                    shouldOpenPostDialog: false,
                })
                activeUI.taskUploadToPostBox(encrypted, {
                    warningText: geti18nString('additional_post_box__steganography_post_failed'),
                })
            } else {
                activeUI.taskPasteIntoPostBox(geti18nString('additional_post_box__encrypted_post_pre', encrypted), {
                    warningText: geti18nString('additional_post_box__encrypted_failed'),
                    shouldOpenPostDialog: false,
                })
            }
            Services.Crypto.publishPostAESKey(token)
        },
        [identity, isSteganography],
    )

    const [showWelcome, setShowWelcome] = useState(false)
    useAsync(getActivatedUI().shouldDisplayWelcome, []).then(x => setShowWelcome(x))

    if (showWelcome) {
        return <NotSetupYetPrompt />
    }

    const ui = <AdditionalPostBoxUI availableTarget={groupsAndPeople} onRequestPost={onRequestPost} {...props} />

    if (identities.length > 1)
        return (
            <>
                <ChooseIdentity />
                {ui}
            </>
        )
    return ui
}
