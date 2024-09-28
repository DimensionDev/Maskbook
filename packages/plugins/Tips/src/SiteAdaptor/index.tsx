import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { MaskColorVar } from '@masknet/theme'
import { Link } from '@mui/material'
import { base } from '../base.js'
import { TipTaskManager } from '../contexts/index.js'
import { guideStorageDefaultValue, setupStorage, storageDefaultValue } from '../storage/index.js'
import { TipsRealmContent } from './components/TipsRealmContent/index.js'
import { Trans } from '@lingui/macro'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(_, context) {
        const storage = context.createKVStorage('memory', storageDefaultValue)
        const guideStorage = context.createKVStorage('persistent', guideStorageDefaultValue)
        setupStorage(storage, guideStorage)
    },
    ApplicationEntries: [
        (() => {
            const name = base.name
            const icon = <Icons.Tips size={36} />
            const iconFilterColor = 'rgba(247, 147, 30, 0.3)'
            return {
                category: 'dapp',
                description: (
                    <Trans>
                        Gift crypto or NFTs tips to any{' '}
                        <Link
                            href="https://next.id/"
                            rel="noopener noreferrer"
                            target="_blank"
                            style={{ color: MaskColorVar.primary }}>
                            Next.ID
                        </Link>{' '}
                        verified users on social media.
                    </Trans>
                ),
                ApplicationEntryID: base.ID,
                icon,
                name,
                iconFilterColor,
                nextIdRequired: true,
                entryWalletConnectedNotRequired: true,
            }
        })(),
    ],
    GlobalInjection() {
        return <TipTaskManager />
    },
    TipsRealm: {
        ID: `${base.ID}_tips`,
        priority: 1,
        UI: {
            Content(props) {
                return <TipsRealmContent {...props} />
            },
        },
    },
}

export default site
