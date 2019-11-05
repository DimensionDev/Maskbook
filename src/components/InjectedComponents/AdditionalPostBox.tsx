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
import { useStylesExtends } from '../custom-ui-helper'

type Keys = keyof Omit<ReturnType<typeof useStyles>, 'MUIInputRoot' | 'MUIInputInput'>
export interface AdditionalPostBoxUIProps extends withClasses<Keys> {
    availableTarget: Array<Person | Group>

    onRequestPost: (target: Array<Person | Group>, text: string) => void
}

const useStyles = makeStyles({
    root: { margin: '10px 0' },
    header: { padding: '8px 12px 0' },
    inputArea: { borderRadius: 0, display: 'flex' },
    avatar: { margin: '12px 0 0 12px' },
    MUIInputRoot: {
        minHeight: 108,
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
    },
    MUIInputInput: {
        minHeight: '3em',
    },
    postButton: { padding: 6, borderTopLeftRadius: 0, borderTopRightRadius: 0, flex: 1, wordBreak: 'break-all' },
})

export function AdditionalPostBoxUI(props: AdditionalPostBoxUIProps) {
    const classes = useStylesExtends(useStyles(), props)

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
            <Paper elevation={0} className={classes.inputArea}>
                {myself && <Avatar className={classes.avatar} person={myself} />}
                <InputBase
                    classes={{ root: classes.MUIInputRoot, input: classes.MUIInputInput }}
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
            <Box display="flex">
                <Button
                    onClick={() => props.onRequestPost(shareTarget, text)}
                    variant="contained"
                    color="primary"
                    className={classes.postButton}
                    disabled={!(shareTarget.length && text)}>
                    {geti18nString('additional_post_box__post_button')}
                </Button>
            </Box>
        </Card>
    )
}

export function AdditionalPostBox(props: Partial<AdditionalPostBoxUIProps>) {
    const people = useFriendsList()
    const groups = useGroupsList()
    const groupsAndPeople = React.useMemo(() => [...groups, ...people], [people, groups])
    const identities = useMyIdentities()
    const identity = useCurrentIdentity()

    const onRequestPost = useCallback(
        async (target: (Person | Group)[], text: string) => {
            const [encrypted, token] = await Services.Crypto.encryptTo(
                text,
                target.map(x => x.identifier),
                identity!.identifier,
            )
            const fullPost = geti18nString('additional_post_box__encrypted_post_pre', encrypted)
            getActivatedUI().taskPasteIntoPostBox(fullPost, {
                warningText: geti18nString('additional_post_box__encrypted_failed'),
                shouldOpenPostDialog: false,
            })
            Services.Crypto.publishPostAESKey(token)
        },
        [identity],
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
