import React from 'react'

import { storiesOf } from '@storybook/react'
import Welcome0 from '../components/Welcomes/0'
import Welcome1a1 from '../components/Welcomes/1a1'
import Welcome1a2 from '../components/Welcomes/1a2'
import Welcome1a3 from '../components/Welcomes/1a3'
import Welcome1a4 from '../components/Welcomes/1a4'
import Welcome1b1 from '../components/Welcomes/1b1'
import { linkTo as to, linkTo } from '@storybook/addon-links'
import { text, boolean } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import Identity from '../components/Dashboard/Identity'
import Dashboard from '../components/Dashboard/Dashboard'

import EncryptionCheckbox from '../components/InjectedComponents/EncryptionCheckbox'
import { AdditionalPostBoxUI } from '../components/InjectedComponents/AdditionalPostBox'
import { AdditionalContent } from '../components/InjectedComponents/AdditionalPostContent'
import { SelectPeopleUI } from '../components/InjectedComponents/SelectPeople'
import { SelectPeopleSingle } from '../components/InjectedComponents/SelectPeopleSingle'
import { DecryptPostUI } from '../components/InjectedComponents/DecryptedPost'
import { AddToKeyStoreUI } from '../components/InjectedComponents/AddToKeyStore'
import { Person } from '../extension/background-script/PeopleService'

storiesOf('Welcome', module)
    .add('Step 0', () => (
        <Welcome0 close={action('Close')} create={to('Welcome', 'Step 1a-1')} restore={to('Welcome', 'Step 1b-1')} />
    ))
    .add('Step 1a-1', () => <Welcome1a1 next={to('Welcome', 'Step 1a-2')} />)
    .add('Step 1a-2', () => <Welcome1a2 next={to('Welcome', 'Step 1a-3')} />)
    .add('Step 1a-3', () => <Welcome1a3 next={to('Welcome', 'Step 1a-4')} />)
    .add('Step 1a-4', () => (
        <Welcome1a4
            copyToClipboard={action('Post click')}
            provePost={text('URL', 'https://maskbook.app/s/#mQINBF-BxAcBEA-zyfSodx')}
        />
    ))
    .add('Step 1b-1', () => <Welcome1b1 back={linkTo('Welcome', 'Step 0')} restore={action('Restore with')} />)

storiesOf('Dashboard (unused)', module)
    .add('Identity Component (unused)', () => (
        <Identity
            avatar={text('Avatar (length > 3 will treat as url)', false as any)}
            fingerprint={text('Fingerprint', 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521')}
            nickname={text('Name', 'Jack Works')}
            username={text('Username', 'jackworks_vfs')}
            atSymbolBefore={boolean('Add a @ on username?', false)}
        />
    ))
    .add('Dashboard (unused)', () => (
        <Dashboard
            addAccount={action('Add account')}
            exportBackup={action('Export backup')}
            onProfileClick={action('Click on profile')}
            identities={[
                {
                    fingerprint: '8AFD47D6A3CDA8CE35884C5104B61F26232DC9C9',
                    nickname: 'Julie Zhuo',
                    username: 'julie.zhuo.9102',
                },
                {
                    fingerprint: '8AFD47D6A3CDA8CE35884C5104B61F26232DC9C9',
                    nickname: 'Yisi Liu',
                    username: 'yisiliu.146',
                },
            ]}
        />
    ))
const FakePost: React.FC<{ title: string }> = props => (
    <>
        {props.title}
        <div style={{ marginBottom: '2em', maxWidth: 500 }}>
            <img width={500} src={require('./post-a.jpg')} style={{ marginBottom: -4 }} />
            <div
                style={{
                    border: '1px solid #dfe0e2',
                    background: 'white',
                    borderTop: 0,
                    borderBottom: 0,
                    padding: 12,
                    paddingBottom: 6,
                }}>
                {props.children}
            </div>
            <img style={{ marginTop: -6 }} width={500} src={require('./post-b.jpg')} />
        </div>
    </>
)

const demoPeople: Person[] = [
    {
        username: 'People A',
        fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521',
    },
    {
        username: 'People B',
        fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521'
            .split('')
            .reverse()
            .join(''),
    },
    {
        username: 'People C',
        fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
    },
    {
        username: 'People D',
        fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
    },
]
storiesOf('Injections', module)
    //
    .add('Checkbox (unused)', () => <EncryptionCheckbox onCheck={action('Check')} />)
    .add('Post box', () => <AdditionalPostBoxUI encrypted="" onCombinationChange={() => {}} />)
    .add('Additional Post Content', () => <AdditionalContent title="Additional Content" children="Content" />)
    .add('Select people', () => {
        function SelectPeople() {
            const [selected, select] = React.useState<Person[]>([])
            return <SelectPeopleUI all={demoPeople} selected={selected} onSetSelected={select} />
        }
        return <SelectPeople />
    })
    .add('Select 1 people (unused)', () => {
        function SelectPeople() {
            const [selected, select] = React.useState<Person>()
            return <SelectPeopleSingle all={demoPeople} selected={selected} onSelect={select} />
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
                    <DecryptPostUI.success data={{ content: msg, signatureVerifyResult: vr }} />
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
