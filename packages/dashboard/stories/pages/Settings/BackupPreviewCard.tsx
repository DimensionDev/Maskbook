import { story } from '@dimensiondev/maskbook-storybook-shared'
import C from '../../../src/pages/Settings/components/BackupPreviewCard'

const { meta, of } = story(C)

export default meta({
    title: 'Pages/Settings/Backup Preview Card',
})

export const BackupPreviewCard = of({
    args: {
        json: {
            email: 'zhihong@mask.io',
            personas: 2,
            accounts: 2,
            posts: 5,
            contacts: 66,
            files: 8,
            wallets: 1,
        },
    },
})
