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
import { AdditionalPostBox } from '../components/InjectedComponents/AdditionalPostBox'
import { DecryptedPost } from '../components/InjectedComponents/DecryptedPost'
import { SelectPeople } from '../components/InjectedComponents/SelectPeople'

storiesOf('Welcome', module)
    .add('Step 0', () => <Welcome0 create={to('Welcome', 'Step 1a-1')} restore={to('Welcome', 'Step 1b-1')} />)
    .add('Step 1a-1', () => <Welcome1a1 next={to('Welcome', 'Step 1a-2')} />)
    .add('Step 1a-2', () => <Welcome1a2 next={to('Welcome', 'Step 1a-3')} />)
    .add('Step 1a-3', () => (
        <Welcome1a3
            next={to('Welcome', 'Step 1a-4')}
            jsonFileName={text('File', 'maskbook-keystore-backup-20190227.json')}
        />
    ))
    .add('Step 1a-4', () => (
        <Welcome1a4 post={action('Post click')} link={text('URL', 'https://maskbook.app/s/#mQINBF-BxAcBEA-zyfSodx')} />
    ))
    .add('Step 1b-1', () => <Welcome1b1 back={linkTo('Welcome', 'Step 0')} restore={action('Restore with')} />)

storiesOf('Dashboard', module)
    .add('Identity Component', () => (
        <Identity
            avatar={text('Avatar (length > 3 will treat as url)', false as any)}
            fingerprint={text('Fingerprint', 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521')}
            nickname={text('Name', 'Jack Works')}
            username={text('Username', 'jackworks_vfs')}
            atSymbolBefore={boolean('Add a @ on username?', false)}
        />
    ))
    .add('Dashboard', () => (
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

storiesOf('Injections', module)
    //
    .add('Checkbox', () => <EncryptionCheckbox onCheck={action('Check')} />)
    .add('Post box', () => <AdditionalPostBox encrypt={x => btoa(unescape(encodeURIComponent(x)))} />)
    .add('Decrypt', () => <DecryptedPost decryptedContent="Decrypted content" />)
    .add('Select people', () => <SelectPeople />)
