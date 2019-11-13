import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { SelectPeopleAndGroupsUI, SelectPeopleAndGroupsUIProps } from '../shared/SelectPeopleAndGroups'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { Avatar } from '../../utils/components/Avatar'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Box, Button, Card, CardHeader, Divider, InputBase, Paper, Typography } from '@material-ui/core'
import { Group, Profile } from '../../database'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { useCurrentIdentity, useFriendsList, useGroupsList, useMyIdentities } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { ChooseIdentity, ChooseIdentityProps } from '../shared/ChooseIdentity'
import { useAsync } from '../../utils/components/AsyncComponent'
import { useStylesExtends, or } from '../custom-ui-helper'
import { steganographyModeSetting } from '../shared-settings/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { BannerProps } from '../Welcomes/Banner'

const useStyles = makeStyles({
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
    availableShareTarget: Array<Profile | Group>
    currentShareTarget: Array<Profile | Group>
    onShareTargetChanged: SelectPeopleAndGroupsUIProps['onSetSelected']
    currentIdentity: Profile | null
    postBoxPlaceholder: string
    postBoxText: string
    postButtonDisabled: boolean
    onPostTextChange: (nextString: string) => void
    onPostButtonClicked: () => void
    SelectPeopleAndGroupsProps?: Partial<SelectPeopleAndGroupsUIProps>
    ChooseIdentityProps?: Partial<ChooseIdentityProps>
}

/**
 * This is the pure UI version of AdditionalPostBox.
 */
export const AdditionalPostBoxUI = React.memo(function AdditionalPostBoxUI(props: AdditionalPostBoxUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const inputRef = useRef<HTMLInputElement>()
    useCapturedInput(inputRef, props.onPostTextChange)

    return (
        <Card>
            <CardHeader
                classes={{ root: classes.header }}
                title={<Typography variant="caption">Maskbook</Typography>}
            />
            <Paper elevation={0} className={classes.inputArea}>
                {props.currentIdentity && <Avatar className={classes.avatar} person={props.currentIdentity} />}
                <InputBase
                    classes={{ root: classes.MUIInputRoot, input: classes.MUIInputInput }}
                    value={props.postBoxText}
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

export interface AdditionalPostBoxProps extends Partial<AdditionalPostBoxUIProps> {
    identities?: Profile[]
    onRequestPost?: (target: (Profile | Group)[], text: string) => void
    onRequestReset?: () => void
    NotSetupYetPromptProps?: Partial<BannerProps>
}

/**
 * This is AdditionalPostBox with default props.
 */
export function AdditionalPostBox(props: AdditionalPostBoxProps) {
    const people = useFriendsList()
    const groups = useGroupsList()
    const availableShareTarget = or(
        props.availableShareTarget,
        React.useMemo(() => [...groups, ...people], [people, groups]),
    )
    const identities = or(props.identities, useMyIdentities())
    const currentIdentity = or(props.currentIdentity, useCurrentIdentity())
    const isSteganography = useValueRef(steganographyModeSetting)

    const onRequestPost = or(
        props.onRequestPost,
        useCallback(
            async (target: (Profile | Group)[], text: string) => {
                const [encrypted, token] = await Services.Crypto.encryptTo(
                    text,
                    target.map(x => x.identifier),
                    currentIdentity!.identifier,
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
            [currentIdentity, isSteganography],
        ),
    )
    const onRequestReset = or(
        props.onRequestReset,
        useCallback(() => {
            setPostText('')
            onShareTargetChanged([])
        }, []),
    )

    const [postText, setPostText] = useState('')
    const [currentShareTarget, onShareTargetChanged] = useState(availableShareTarget)

    const [showWelcome, setShowWelcome] = useState(false)
    useAsync(getActivatedUI().shouldDisplayWelcome, []).then(x => setShowWelcome(x))
    if (showWelcome || identities.length === 0) {
        return <NotSetupYetPrompt {...props.NotSetupYetPromptProps} />
    }

    const ui = (
        <AdditionalPostBoxUI
            currentIdentity={currentIdentity}
            availableShareTarget={availableShareTarget}
            currentShareTarget={currentShareTarget}
            onShareTargetChanged={onShareTargetChanged}
            postBoxText={postText}
            postBoxPlaceholder={geti18nString(
                currentIdentity && currentIdentity.nickname
                    ? 'additional_post_box__placeholder_w_name'
                    : 'additional_post_box__placeholder_wo_name',
                currentIdentity ? currentIdentity.nickname : '',
            )}
            onPostTextChange={setPostText}
            onPostButtonClicked={() => {
                onRequestPost(currentShareTarget, postText)
                onRequestReset()
            }}
            postButtonDisabled={!(currentShareTarget.length && postText)}
            {...props}
        />
    )

    if (identities.length > 1)
        return (
            <>
                <ChooseIdentity {...props.ChooseIdentityProps} />
                {ui}
            </>
        )
    return ui
}
