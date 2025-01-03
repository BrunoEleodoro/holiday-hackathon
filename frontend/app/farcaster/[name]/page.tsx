'use client'

import { FrameContext } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import FrameSDK from '@farcaster/frame-sdk'

export default function Farcaster() {
  const [context, setContext] = useState<FrameContext>();

  return <div>{context?.client.clientFid} + {context?.user.displayName} + {context?.user.username} + {context?.user.fid} </div>
}
