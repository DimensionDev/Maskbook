import type { Meta } from '@storybook/react'
import component from '../../../src/pages/Settings/components/BackupPreviewCard.js'

export default {
    component,
    title: 'Pages/Settings/Backup Preview Card',
    args: {
        json: {
            personas: 2,
            accounts: 2,
            posts: 5,
            contacts: 66,
            files: 8,
            wallets: 1,
            createdAt: 0,
            relations: 0,
        },
    },
} as Meta<typeof component>
