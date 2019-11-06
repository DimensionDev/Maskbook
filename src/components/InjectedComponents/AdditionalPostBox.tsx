import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { SelectPeopleAndGroupsUI, SelectPeopleAndGroupsUIProps } from '../shared/SelectPeopleAndGroups'
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
import { useStylesExtends, or } from '../custom-ui-helper'

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

export interface AdditionalPostBoxUIProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles, 'MUIInputInput' | 'MUIInputRoot'>> {
    availableShareTarget: Array<Person | Group>
    currentShareTarget: Array<Person | Group>
    onShareTargetChanged: SelectPeopleAndGroupsUIProps['onSetSelected']
    currentIdentity: Person | null
    postBoxPlaceholder: string
    postButtonDisabled: boolean
    onPostTextChange: (nextString: string) => void
    onPostButtonClicked: () => void
    SelectPeopleAndGroupsProps?: Partial<SelectPeopleAndGroupsUIProps>
}

/**
 * This is the pure UI version of AdditionalPostBox.
 */
export const AdditionalPostBoxUI = React.memo(function(props: AdditionalPostBoxUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const inputRef = useRef<HTMLInputElement>()
    useCapturedInput(inputRef, props.onPostTextChange)

    return (
        <Card className={classes.root}>
            <CardHeader
                classes={{ root: classes.header }}
                title={<Typography variant="caption">Maskbook</Typography>}
            />
            <Paper elevation={0} className={classes.inputArea}>
                {props.currentIdentity && <Avatar className={classes.avatar} person={props.currentIdentity} />}
                <InputBase
                    classes={{ root: classes.MUIInputRoot, input: classes.MUIInputInput }}
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    placeholder={props.postBoxPlaceholder}
                />
            </Paper>
            <Divider />
            <Paper elevation={2}>
                <SelectPeopleAndGroupsUI
                    ignoreMyself
                    items={props.availableShareTarget}
                    onSetSelected={props.onShareTargetChanged}
                    selected={props.currentShareTarget}
                    {...props.SelectPeopleAndGroupsProps}
                />
            </Paper>
            <Divider />
            <Box display="flex">
                <Button
                    onClick={props.onPostButtonClicked}
                    variant="contained"
                    color="primary"
                    className={classes.postButton}
                    disabled={props.postButtonDisabled}>
                    {geti18nString('additional_post_box__post_button')}
                </Button>
            </Box>
        </Card>
    )
})

/**
 * This is AdditionalPostBox with default props.
 */
export function AdditionalPostBox(
    props: Partial<AdditionalPostBoxUIProps> & {
        identities?: Person[]
        onRequestPost?: (target: (Person | Group)[], text: string) => void
    },
) {
    const people = useFriendsList()
    const groups = useGroupsList()
    const availableShareTarget = or(
        props.availableShareTarget,
        React.useMemo(() => [...groups, ...people], [people, groups]),
    )
    const identities = or(props.identities, useMyIdentities())
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())

    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Person | Group)[], text: string) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    text,
                    target.map(x => x.identifier),
                    currentIdentity!.identifier,
                )
                const fullPost = geti18nString('additional_post_box__encrypted_post_pre', encrypted)
                getActivatedUI().taskPasteIntoPostBox(fullPost, {
                    warningText: geti18nString('additional_post_box__encrypted_failed'),
                    shouldOpenPostDialog: false,
                })
                Services.Crypto.publishPostAESKey(token)
            },
            [currentIdentity],
        ),
    )

    const [postText, setPostText] = useState('')
    const [currentShareTarget, onShareTargetChanged] = useState(availableShareTarget)

    const [showWelcome, setShowWelcome] = useState(false)
    useAsync(getActivatedUI().shouldDisplayWelcome, []).then(x => setShowWelcome(x))
    // TODO: ??? should we do this without including `ui` ???
    if (showWelcome) {
        return <NotSetupYetPrompt />
    }

    const ui = (
        <AdditionalPostBoxUI
            currentIdentity={currentIdentity}
            availableShareTarget={availableShareTarget}
            currentShareTarget={currentShareTarget}
            onShareTargetChanged={onShareTargetChanged}
            postBoxPlaceholder={geti18nString(
                currentIdentity && currentIdentity.nickname
                    ? 'additional_post_box__placeholder_w_name'
                    : 'additional_post_box__placeholder_wo_name',
                currentIdentity ? currentIdentity.nickname : '',
            )}
            onPostTextChange={setPostText}
            onPostButtonClicked={() => onRequestPost(currentShareTarget, postText)}
            postButtonDisabled={!(currentShareTarget.length && postText)}
            {...props}
        />
    )

    if (identities.length > 1)
        return (
            <>
                <ChooseIdentity />
                {ui}
            </>
        )
    return ui
}
