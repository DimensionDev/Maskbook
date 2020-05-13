import React from 'react'
import { storiesOf } from '@storybook/react'
import { text, boolean, select, radios } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { AdditionalContent, AdditionalIcon } from '../components/InjectedComponents/AdditionalPostContent'
import { DecryptPostFailed } from '../components/InjectedComponents/DecryptedPost/DecryptPostFailed'
import { DecryptPostAwaiting } from '../components/InjectedComponents/DecryptedPost/DecryptPostAwaiting'
import { DecryptPostSuccess } from '../components/InjectedComponents/DecryptedPost/DecryptedPostSuccess'
import { AddToKeyStoreUI } from '../components/InjectedComponents/AddToKeyStore'
import { useShareMenu } from '../components/InjectedComponents/SelectPeopleDialog'
import { sleep } from '../utils/utils'
import { Paper, MuiThemeProvider, Typography, Divider, Button, Link } from '@material-ui/core'
import { demoPeople as demoProfiles, demoGroup } from './demoPeopleOrGroups'
import { PostCommentDecrypted } from '../components/InjectedComponents/PostComments'
import { CommentBox } from '../components/InjectedComponents/CommentBox'
import type { DecryptionProgress } from '../extension/background-script/CryptoServices/decryptFrom'
import { PersonOrGroupInChip, PersonOrGroupInList } from '../components/shared/SelectPeopleAndGroups'
import { MaskbookLightTheme } from '../utils/theme'
import { PostDialog } from '../components/InjectedComponents/PostDialog'
import { PostDialogHint } from '../components/InjectedComponents/PostDialogHint'
import {
    makeTypedMessage,
    TypedMessageText,
    TypedMessageUnknown,
    TypedMessageComplex,
} from '../extension/background-script/CryptoServices/utils'
import {
    DefaultTypedMessageTextRenderer,
    DefaultTypedMessageComplexRenderer,
    DefaultTypedMessageUnknownRenderer,
} from '../components/InjectedComponents/TypedMessageRenderer'
import { useTwitterThemedPostDialogHint } from '../social-network-provider/twitter.com/ui/injectPostDialogHint'
import { useTwitterButton } from '../social-network-provider/twitter.com/utils/theme'
import { TwitterThemeProvider } from '../social-network-provider/twitter.com/ui/custom'
import { PersonKnownSelf, PersonKnownOthers } from '../components/InjectedComponents/PersonKnown'
import { figmaLink } from './utils'

storiesOf('Injections', module)
    .add('PersonOrGroupInChip', () => (
        <>
            {demoGroup.map((g) => (
                <PersonOrGroupInChip item={g} />
            ))}
        </>
    ))
    .add('PersonOrGroupInList', () => (
        <Paper>
            {demoGroup.map((g) => (
                <PersonOrGroupInList onClick={action('click')} item={g} />
            ))}
        </Paper>
    ))
    .add('Additional Post Content', () => {
        const icon = radios('RightIcon', { ...AdditionalIcon, No: 'None' }, 'None')
        return (
            <Paper style={{ padding: 24 }}>
                <AdditionalContent
                    progress={boolean('progress', false)}
                    titleIcon={icon === 'None' ? undefined : icon}
                    title={text('Title', 'Additional text')}
                    message={text('Rich text', 'a[text](https://g.cn/)')}
                    headerActions={boolean('Has right action?', true) ? <Link>An action</Link> : undefined}
                />
            </Paper>
        )
    })
    .add('Typed Message Renderer', () => {
        const _text: TypedMessageText = {
            type: 'text',
            version: 1,
            content: text('DefaultTypedMessageTextRenderer', 'text'),
        }
        const unknown: TypedMessageUnknown = { type: 'unknown', version: 1 }
        const complex: TypedMessageComplex = {
            type: 'complex',
            version: 1,
            items: [_text, unknown],
        }
        const divider = <Divider style={{ marginTop: 24 }} />
        return (
            <>
                <Paper>
                    <Typography>DefaultTypedMessageTextRenderer</Typography>
                    <DefaultTypedMessageTextRenderer message={_text} />
                    {divider}
                    <Typography>DefaultTypedMessageComplexRenderer</Typography>
                    <DefaultTypedMessageComplexRenderer message={complex} />
                    {divider}
                    <Typography>DefaultTypedMessageUnknownRenderer</Typography>
                    <DefaultTypedMessageUnknownRenderer message={unknown} />
                </Paper>
            </>
        )
    })
    .add('Select people dialog', () => {
        function SelectPeople() {
            const { ShareMenu, showShare } = useShareMenu(
                demoProfiles,
                async () => sleep(3000),
                boolean('Has frozen item?', true) ? [demoProfiles[0]] : [],
            )
            React.useEffect(() => {
                showShare()
            })
            return ShareMenu
        }
        return <SelectPeople />
    })
    .add('Decrypted post', () => {
        const msg = text(
            'Post content',
            `This is a post
        that with multiline.

        Hello world!`,
        )
        const vr = boolean('Verified', true)
        enum ProgressType {
            finding_person_public_key,
            finding_post_key,
            undefined,
            init,
        }
        function getProgress(x: ProgressType): DecryptionProgress | undefined {
            switch (x) {
                case ProgressType.finding_person_public_key:
                    return { progress: 'finding_person_public_key' }
                case ProgressType.finding_post_key:
                    return { progress: 'finding_post_key' }
                case ProgressType.init:
                    return { progress: 'init' }
                case ProgressType.undefined:
                    return undefined
            }
        }
        const progress = getProgress(
            select(
                'Decryption progress',
                {
                    finding_person_public_key: ProgressType.finding_person_public_key,
                    finding_post_key: ProgressType.finding_post_key,
                    undefined: ProgressType.undefined,
                    init: ProgressType.init,
                },
                ProgressType.undefined,
            ),
        )
        return (
            <>
                <FakePost title="Decrypted:">
                    <DecryptPostSuccess
                        alreadySelectedPreviously={[]}
                        requestAppendRecipients={async () => {}}
                        profiles={demoProfiles}
                        data={{ content: makeTypedMessage(msg), signatureVerifyResult: vr }}
                    />
                </FakePost>
                <FakePost title="Decrypting:">
                    <DecryptPostAwaiting type={progress} />
                </FakePost>
                <FakePost title="Failed:">
                    <DecryptPostFailed error={new Error('Error message')} />
                </FakePost>
            </>
        )
    })
    .add('Verify Prove Post', () => {
        return (
            <>
                <FakePost title="Success:">
                    <AddToKeyStoreUI.success />
                </FakePost>
                <FakePost title="Verifying:">
                    <AddToKeyStoreUI.awaiting />
                </FakePost>
                <FakePost title="Failed:">
                    <AddToKeyStoreUI.failed error={new Error('Verify Failed!')} />
                </FakePost>
            </>
        )
    })
    .add('Decrypted comment', () => {
        return <PostCommentDecrypted children={text('Comment', 'Post comment')} />
    })
    .add('Comment box', () => {
        return <CommentBox onSubmit={action('submit')} />
    })
    .add('Person Known', () => {
        const bio = text('Bio', '__bio__content__')
        return (
            <>
                Self:
                <PersonKnownSelf bio={bio} />
                <br />
                Others:
                <PersonKnownOthers bio={bio} />
            </>
        )
    })
    .add(
        'Post Dialog',
        () => {
            const decoder = (encodedStr: string) => {
                const parser = new DOMParser()
                const dom = parser.parseFromString('<!doctype html><body>' + encodedStr, 'text/html')
                console.log(dom.body.textContent)
                // eslint-disable-next-line no-eval
                return new Map(Object.entries(eval(`(${dom.body.textContent})`)))
            }
            try {
                const meta = decoder(text('Metadata', '{}'))
                return <PostDialog open={[true, () => void 0]} typedMessageMetadata={meta} />
            } catch (e) {
                return <>{e.message}</>
            }
        },
        figmaLink('https://www.figma.com/file/nDyLQp036eHgcgUXeFmNA1/Post-Composition-v1'),
    )
    .add('Post Dialog Hint', () => {
        return (
            <>
                Vanilla:
                <PostDialogHint onHintButtonClicked={action('clicked')} />
                Twitter flavor:
                <TwitterThemeProvider>
                    <TwitterFlavorPostDialogHint />
                </TwitterThemeProvider>
            </>
        )
        function TwitterFlavorPostDialogHint() {
            const style = { ...useTwitterThemedPostDialogHint(), ...useTwitterButton() }
            return <PostDialogHint classes={style} onHintButtonClicked={action('clicked')} />
        }
    })

function FakePost(props: React.PropsWithChildren<{ title: string }>) {
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            {props.title}
            <div style={{ marginBottom: '2em', maxWidth: 500 }}>
                <img width={500} src={require('./post-a.jpg')} style={{ marginBottom: -12 }} />
                <div
                    style={{
                        border: '1px solid #dfe0e2',
                        background: 'white',
                        borderBottom: 0,
                        borderTop: 0,
                        padding: '0 12px 6px',
                    }}
                    children={props.children}></div>
                <img width={500} src={require('./post-b.jpg')} />
            </div>
        </MuiThemeProvider>
    )
}
