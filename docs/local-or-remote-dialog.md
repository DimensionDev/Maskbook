---
author: zhouhancheng
maintainer:
  - zhouhancheng
---

# Local Dialog vs Remote Dialog

## What is remote-dialog

```ts
function useRemoteControlledDialog<
  T extends {
    open: boolean
  },
>(
  event: UnboundedRegistry<T>,
  onUpdateByRemote?: ((ev: T) => void) | undefined,
  tabType?: 'self' | 'activated',
): readonly [boolean, (ev: T) => void]
```

`remote-dialog` serves a special universal scene. E.g. Ethereum transaction state track dialog, Select wallet dialog, they are used at lot of places. It is a global singleton:

```ts
export const EthereumPluginDefine: PluginConfig = {
  PageComponent() {
    return <TransactionDialog />
  },
}
```

## What is local-dialog

`local-dialog` serves for detailed business logic. Its props provided by parent component, since it is part of the detailed business actually, its code located under the parent component which open/close it.

```ts
<SnapshotCard>
  //...
  <VoteConfirmDialog
    open={open}
    loading={loading}
    onClose={() => setOpen(false)}
    choiceText={choices[choice - 1]}
    message={message}
    power={power}
    onVoteConfirm={onVoteConfirm}
  />
</SnapshotCard>
```

## When not to use remote-dialog

1. If you render `remote-dialog` under twitter timeline payload post component. As you click the open dialog button, you will find several dialogs would be opened, because each instance has been loaded when there're multiple payload posts at the timeline and are listening to the open dialog event.

2. `remote-dialog` loads in advance, usually it only loads once after the web page loads, which leads to that data returned by its network request hooks isn't the latest. Even a dialog is not rendered under on timeline, there's only one instance rendered at the same time. If you want it to fetch the latest network data each time when you open it, consider using `local-dialog`.
