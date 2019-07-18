import React from 'react'
import { storiesOf } from '@storybook/react'
import { text, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { AdditionalPostBoxUI } from '../components/InjectedComponents/AdditionalPostBox'
import { AdditionalContent } from '../components/InjectedComponents/AdditionalPostContent'
import { DecryptPostUI } from '../components/InjectedComponents/DecryptedPost'
import { AddToKeyStoreUI } from '../components/InjectedComponents/AddToKeyStore'
import { useShareMenu } from '../components/InjectedComponents/SelectPeopleDialog'
import { sleep } from '../utils/utils'
import { Button, Paper } from '@material-ui/core'
import { RenderInShadowRootWrapper } from '../utils/jss/renderInShadowRoot'
import { demoPeople } from './demoPeople'
import { PostCommentDecrypted } from '../components/InjectedComponents/PostComments'

storiesOf('Injections', module)
    .add('AdditionalPostBox', () => <AdditionalPostBoxUI people={demoPeople} onRequestPost={action('onRequestPost')} />)
    .add('Additional Post Content', () => (
        <Paper>
            <AdditionalContent title="Additional Content" renderText={text('Rich text', '')} />
        </Paper>
    ))
    .add('Select people dialog', () => {
        function SelectPeople() {
            const { ShareMenu, showShare } = useShareMenu(
                demoPeople,
                async people => sleep(3000),
                boolean('Has frozen item?', true) ? [demoPeople[0]] : [],
            )
            return (
                <RenderInShadowRootWrapper>
                    {ShareMenu}
                    <Button onClick={showShare}>Show dialog</Button>
                </RenderInShadowRootWrapper>
            )
        }
        return <SelectPeople />
    })
    .add('Decrypted post', () => {
        const msg = text(
            'Post content',
            `
        This is a post
        that with multiline.

        Hello world!`,
        )
        const vr = boolean('Verified', true)
        return (
            <>
                <FakePost title="Decrypted:">
                    <DecryptPostUI.success
                        alreadySelectedPreviously={[]}
                        requestAppendRecipients={async () => {}}
                        people={demoPeople}
                        data={{ content: msg, signatureVerifyResult: vr }}
                    />
                </FakePost>
                <FakePost title="Decrypting:">{DecryptPostUI.awaiting}</FakePost>
                <FakePost title="Failed:">
                    <DecryptPostUI.failed error={new Error('Error message')} />
                </FakePost>
            </>
        )
    })
    .add('Verify Prove Post', () => {
        return (
            <>
                <FakePost title="Success:">{AddToKeyStoreUI.success}</FakePost>
                <FakePost title="Verifying:">{AddToKeyStoreUI.awaiting}</FakePost>
                <FakePost title="Failed:">
                    <AddToKeyStoreUI.failed error={new Error('Verify Failed!')} />
                </FakePost>
            </>
        )
    })
    .add('Decrypted comment', () => {
        return <PostCommentDecrypted />
    })

function FakePost(props: { title: string; children: any }) {
    return (
        <>
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
                        transform: 'translateY(-14px)',
                    }}>
                    {props.children}
                </div>
                <img style={{ marginTop: -20 }} width={500} src={require('./post-b.jpg')} />
            </div>
        </>
    )
}
