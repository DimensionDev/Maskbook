import { story } from '@masknet/storybook-shared'
import { BackupPreview } from '../../../src/pages/Settings/components/BackupPreview.js'

const { meta, of } = story(BackupPreview)

export default meta({
    title: 'Pages/Settings/Backup Preview Card',
})

export const BackupPreviewCard = of({
    args: {
        info: {
            personas: ['persona1', 'persona2'],
            accounts: 2,
            posts: 5,
            contacts: 66,
            files: 8,
            wallets: ['0x0000000000000000000000000000000000000000', '0x1111111111111111111111111111111111111111'],
            createdAt: 0,
            relations: 0,
            countOfWallets: 0,
        },
    },
})
