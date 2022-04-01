---
author: Randolph
---

# Quick start for Plugin Development

## 1. Introduction

This is an example of how to develop plugin according to tools provided by Mask. And our task is to obtain ENS from user data, and display details about the ENS domain in timeline and profile of twitter. Besides, user can search specific ENS details in application board.

## 2. Start a plugin file

Create a plugin folder by entering following command

> npx gulp new-pkg

After entering related information about the plugin, a plugin folder will be created in `packages/plugins`. This folder contains lots of files, and core files are `SNSAdaptor` and `Worker`. The former contains all the code related to front-end interaction, the latter plays a database-like role.
Since we want to add a application into maskbook, we need to add related config to register:

`packages/mask/src/plugin-infra/register.js`

```JavaScript
    import '@masknet/plugin-ENS'
```

## 3. How to inject UI

We will inject our UI in three places of twitter to provide different services. And `Plugin.SNSAdaptor.Definition` in `SNSAdaptor` is where we inject our UI mainly.

### 3.1 Add UI in application board

Add following config：

```JavaScript
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                return (
                    <ApplicationEntry
                        title="ENS"
                        disabled={disabled}
                        icon={new URL('./assets/ens.png', import.meta.url).toString()}
                        onClick={() =>
                            CrossIsolationMessages.events.requestComposition.sendToLocal({
                                reason: 'timeline',
                                open: true,
                                options: {
                                    startupPlugin: base.ID,
                                },
                            })
                        }
                    />
                )
            },
            defaultSortingPriority: 1,
        },
    ],
```

### 3.2 Add UI in Timeline

It is normal that we inject specific UI according to content in timeline. Now we want to parse the URLs in the content to generate our UI, Mask provide `PostInspector` entry:

```JavaScript
 PostInspector: function Component(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks() // links we find in timeline content
        const link = links.find(isENS) // find ENS url
        if (!link) return null
        return <ENSCard url={link} /> // render UI if ENS URL is found
    },
```

### 3.3 Add UI as a tab in user profile

We have injected `web3` tab in user profile, so we add a tab called `ENS` under it. Same as before, add following config in `Plugin.SNSAdaptor.Definition`:

```JavaScript
 ProfileTabs: [
     {
         ID: `${PLUGIN_ID}_tabContent`,  // PLUGIN_ID is generated when we use codegen command
         label: 'ENS',
         priority: 10,
         UI: {
             TabContent: ENSCard,  // ENSCard is the UI we want to display
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
