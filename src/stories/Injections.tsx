import React from 'react'
import { storiesOf } from '@storybook/react'
import { text, boolean, select } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { AdditionalPostBox } from '../components/InjectedComponents/AdditionalPostBox'
import { AdditionalContent } from '../components/InjectedComponents/AdditionalPostContent'
import {
    DecryptPostSuccess,
    DecryptPostAwaiting,
    DecryptPostFailed,
} from '../components/InjectedComponents/DecryptedPost'
import { AddToKeyStoreUI } from '../components/InjectedComponents/AddToKeyStore'
import { useShareMenu } from '../components/InjectedComponents/SelectPeopleDialog'
import { sleep } from '../utils/utils'
import { Paper, MuiThemeProvider } from '@material-ui/core'
import { demoPeople, demoGroup } from './demoPeopleOrGroups'
import { PostCommentDecrypted } from '../components/InjectedComponents/PostComments'
import { CommentBox } from '../components/InjectedComponents/CommentBox'
import { DecryptionProgress } from '../extension/background-script/CryptoServices/decryptFrom'
import { PersonOrGroupInChip, PersonOrGroupInList } from '../components/shared/SelectPeopleAndGroups'
import { MaskbookLightTheme } from '../utils/theme'
import { PostDialog } from '../components/InjectedComponents/PostDialog'
import { PostDialogHint } from '../components/InjectedComponents/PostDialogHint'

storiesOf('Injections', module)
    .add('PersonOrGroupInChip', () => (
        <>
            {demoGroup.map(g => (
                <PersonOrGroupInChip item={g} />
            ))}
        </>
    ))
    .add('PersonOrGroupInList', () => (
        <Paper>
            {demoGroup.map(g => (
                <PersonOrGroupInList onClick={action('click')} item={g} />
            ))}
        </Paper>
    ))
    .add('AdditionalPostBox', () => <AdditionalPostBox onRequestPost={action('onRequestPost')} />)
    .add('Additional Post Content', () => (
        <Paper>
            <AdditionalContent
                title={text('Title', 'Additional text')}
                renderText={text('Rich text', 'a[text](https://g.cn/)')}
            />
        </Paper>
    ))
    .add('Select people dialog', () => {
        function SelectPeople() {
            const { ShareMenu, showShare } = useShareMenu(
                demoPeople,
                async () => sleep(3000),
                boolean('Has frozen item?', true) ? [demoPeople[0]] : [],
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
        }
        function getProgress(x: ProgressType): DecryptionProgress | undefined {
            switch (x) {
                case ProgressType.finding_person_public_key:
                    return { progress: 'finding_person_public_key' }
                case ProgressType.finding_post_key:
                    return { progress: 'finding_post_key' }
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
                        people={demoPeople}
                        data={{ content: msg, signatureVerifyResult: vr }}
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
    .add('Post Dialog', () => {
        return <PostDialog open />
    })
    .add('Post Dialog Hint', () => {
        return <PostDialogHint onHintButtonClicked={action('clicked')} />
    })

function FakePost(props: React.PropsWithChildren<{ title: string }>) {
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            {props.title}
            <div style={{ marginBottom: '2em', maxWidth: 500 }}>
                <img width={500} src={require('./post-a.jpg')} style={{ marginBottom: -4 }} />
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
