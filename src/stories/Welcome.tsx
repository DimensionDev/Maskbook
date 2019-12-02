import React from 'react'
import { storiesOf } from '@storybook/react'
import Welcome1a1a from '../components/Welcomes/1a1a'
import Welcome1a1b from '../components/Welcomes/1a1b'
import Welcome1a2 from '../components/Welcomes/1a2'
import Welcome1a3a from '../components/Welcomes/1a3a'
import Welcome1a3b from '../components/Welcomes/1a3b'
import Welcome1a4 from '../components/Welcomes/1a4'
import Welcome1b1 from '../components/Welcomes/1b1'
import { linkTo as to, linkTo } from '@storybook/addon-links'
import { text, boolean, number } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import { BannerUI } from '../components/Welcomes/Banner'
import { Dialog } from '@material-ui/core'
import QRScanner from '../components/Welcomes/QRScanner'
import { demoPeople } from './demoPeopleOrGroups'

const ResponsiveDialog = Dialog
storiesOf('Welcome', module)
    .add('Banner', () => {
        const hiddenClose = boolean('Hidden close button', false)
        const desc = text('description', '')
        const title = text('title', '')
        const isValid = boolean('is username valid', true)
        return (
            <BannerUI
                close={hiddenClose ? 'hidden' : { onClose: action('Close') }}
                nextStep={{ onClick: to('Welcome', 'Step 0') }}
                username={{
                    defaultValue: text('default value', ''),
                    value: text('current value', ''),
                    isValid: () => isValid,
                    onChange: action('on username change'),
                }}
                description={desc === '' ? undefined : desc}
                title={title === '' ? undefined : title}
            />
        )
    })
    .add('Step 1a-1a', () => (
        <ResponsiveDialog open>
            <Welcome1a1a
                next={() => to('Welcome', 'Step 1a-2')()}
                identities={demoPeople}
                linkNewSocialNetworks={to('Welcome', 'Step 1a-1b')}
            />
        </ResponsiveDialog>
    ))
    .add('Step 1a-1b', () => (
        <ResponsiveDialog open>
            <Welcome1a1b restoreBackup={to('Welcome', 'Step 1b-1')} useExistingAccounts={to('Welcome', 'Step 1a-1a')} />
        </ResponsiveDialog>
    ))
    .add('Step 1a-2', () => (
        <ResponsiveDialog open>
            <Welcome1a2 next={to('Welcome', 'Step 1a-3a')} back={to('Welcome', 'Step 0')} />
        </ResponsiveDialog>
    ))
    .add('Step 1a-3a', () => {
        const mnemonicWord = text('mnemonicWord', '')
        return (
            <ResponsiveDialog open>
                <Welcome1a3a
                    back={to('Welcome', 'Step 1a-2')}
                    availableIdentityCount={number('id counts', 1)}
                    onConnectOtherPerson={action('connect others')}
                    onRestoreByMnemonicWord={action('restore')}
                    onGenerateKey={action('generate key')}
                    generatedMnemonicWord={mnemonicWord === '' ? null : mnemonicWord}
                    next={to('Welcome', 'Step 1a-3b')}
                />
            </ResponsiveDialog>
        )
    })
    .add('Step 1a-3b', () => (
        <ResponsiveDialog open>
            <Welcome1a3b next={to('Welcome', 'Step 1a-4')} />
        </ResponsiveDialog>
    ))
    .add('Step 1a-4', () => (
        <ResponsiveDialog open>
            <Welcome1a4
                back={to('Welcome', 'Step 1a-3a')}
                hasManual={boolean('hasManual', true)}
                hasBio={boolean('hasBio', true)}
                hasPost={boolean('hasPost', true)}
                bioDisabled={boolean('bioDisabled', false)}
                postDisabled={boolean('postDisabled', false)}
                provePost={text('Prove', '🔒ApfdMwLoV/URKn7grgcNWdMR2iWMGdHpQBk5LVGFxhul🔒')}
                requestAutoVerify={action('Auto')}
                requestManualVerify={action('Manual')}
                requestVerifyBio={async () => void null}
            />
        </ResponsiveDialog>
    ))
    .add('Step 1b-1', () => (
        <ResponsiveDialog open>
            <Welcome1b1 restore={async () => void action('Restore with')} finish={() => {}} verify={async () => {}} />
        </ResponsiveDialog>
    ))
    .add('QRCode Scanner', () => (
        <QRScanner
            scanning={boolean('start scanning?', false)}
            height={number('width', 500)}
            width={number('height', 500)}
            onResult={action('scan')}
            onError={action('error')}
        />
    ))
