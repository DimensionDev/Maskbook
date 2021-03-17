// // import { useCurrentIdentity, useFriendsList } from '../DataSource/useActivatedUI'
// import { useState, useEffect, useMemo, useRef } from 'react'
// import { usePostInfoDetails, usePostInfo } from '../DataSource/usePostInfo'
// import { debugModeSetting } from '../../settings/settings'
// import { DebugList } from '../DebugModeUI/DebugList'
// import { useValueRef } from '../../utils/hooks/useValueRef'


// export interface VCentCurrentBidProps { }

// export function VCentCurrentBid(props: VCentCurrentBidProps) {
//     const postId = usePostInfoDetails('postIdentifier')?.toText()
//     const bids = fetch("https://v.cent.co/data/tweet-txn?tweetID=" + postId)
//         .then(data => { return data.json() })
//         .then(res => { console.log(res) })
//         .catch(error => console.log(error));
//     if (typeof bids !== Array()) {
//         return null;
//     }
//     const highestBid = bids[0]
//     const isDebugging = useValueRef(debugModeSetting)
//     const [alreadySelectedPreviously, setAlreadySelectedPreviously] = useState<Profile[]>([])


//     const debugInfo = isDebugging ? (
//         <DebugList
//             items={[
//                 ['Highest Bid: ', highestBid],
//                 ['Bids: \n', bids]
//             ]}
//         />
//     ) : null

//     return null;

// }