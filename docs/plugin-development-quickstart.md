---
author: Randolph
---

# Quick start for Plugin Development

## 1. Introduction

This is an example of how to develop plugin according to tools provided by Mask. And our task is to obtain ENS from user data, and display details about the ENS domain in timeline and profile of twitter. Besides, user can search specific ENS details in application board.

## 2. Start a plugin file

Create a plugin folder by entering following command

> npx gulp new-pkg

## 3. How to inject UI

We will inject our UI in three places of twitter to provide different services. And `Plugin.SNSAdaptor.Definition` in `SNSAdaptor` is where we inject our UI mainly.

### 3.1 Add UI in application board

Add related config：

```JavaScript
  ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('./assets/ens.png', import.meta.url).toString()} />
            const name = { i18nKey: '__plugin_name', fallback: 'ENS' }
            const iconFilterColor = 'rgba(183, 212, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                disabled={disabled}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={() => setOpen(true)}
                            />
                            <ENSDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 5,
                name,
                icon,
                iconFilterColor,
                tutorialLink: 'https://ens.domains',
            }
        })(),
    ],
```

change plugin Definition config:

```JavaScript
export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'ENS' }, link: '' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'beta',  // set as 'stable' if this plugin exists in production environment
    },
    experimentalMark: true,
    i18n: languages,
}
```

### 3.2 Add UI in Timeline

It is normal that we inject specific UI according to content in timeline. Now we want to parse the URLs in the content to generate our UI, Mask provide `PostInspector` entry:

```JavaScript
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        return asset ? <Renderer chainId={asset?.chain_id} projectId={asset.project_id} /> : null
    },
```

### 3.3 Add UI as a tab in user profile

We have injected `web3` tab in user profile, so we add a tab called `ENS` under it. Same as before, add following config in `Plugin.SNSAdaptor.Definition`:

```JavaScript
 ProfileTabs: [
  ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'ENS',
            priority: 10,
            UI: {
                TabContent: (identity) => (
                    <ENSCard
                        identity={{
                            userId: identity?.identity?.identifier?.userId,
                            bio: identity?.identity?.bio,
                            nickname: identity?.identity?.nickname,
                        }}
                    />
                ),
            },
        },
    ],
```

Now we have created entries to inject UI, the rest is to add style and interaction logic like writing a web page in `ENSCard` and `ENSDialog` to meet our needs.

## 4. How to get data from blockchain

We have successfully injected entries in twitter, now we can focus on the UI and interaction. Additionally, we want to see ENS details, so we need to acquire information on blockchain.
We can grab user's ENS in their profile and ENS url in timeline, and we want to inject a card to show details like owner and expiration date of this ENS domain. For acquiring information from blockchain, we need smart contract address of ENS which can be found in ENS website. The smart contract address we need is `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`, so we need to call related function of this smart contract.
Copy ABI of this smart contract from `etherscan` and make it as a `json` file. Mask provide tools to use it:

```JavaScript
import { useContract } from '@masknet/web3-shared-evm'
import ENS_REGISTRY_ABI from '@masknet/web3-contracts/abis/ens_registry.json'
import { hash } from 'eth-ens-namehash'

const contract = useContract('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', ENS_REGISTRY_ABI)

const handleSearch = useCallback(async () => {
        const nameHash = hash(ensName) // name string should be hashed to be a node
        const owner = await contract?.methods?.owner(nameHash)?.call({ from: account }) // get owner
        const resolver = await contract?.methods?.resolver(nameHash)?.call({ from: account }) // get resolver
        const ttl = await contract?.methods?.ttl(nameHash)?.call({ from: account }) // get ttl
        console.log({ owner, resolver, ttl, nameHash })
    }, [ensName])
```

Be careful about contract address and ABI. If you use mismatched information, the function call will fail
The above is an example to get some basic information about ENS. If you need more, you can refer to its ABI, calling other methods to read the data from blockchain.
