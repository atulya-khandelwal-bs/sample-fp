import React from "react";
import { FPVideoCalling } from "./components/FPVideoCalling.tsx";
import "./FPCallApp.css";

interface FPCallAppProps {
  userId: string;
  peerId: string;
  channel: string;
  isInitiator: boolean;
  onEndCall: () => void;
  isAudioCall?: boolean;
}

function FPCallApp({
  userId,
  peerId,
  channel,
  isInitiator,
  onEndCall,
  isAudioCall = false,
}: FPCallAppProps): React.JSX.Element {
  return (
    <div>
      <FPVideoCalling
        userId={userId}
        peerId={peerId}
        channel={channel}
        isInitiator={isInitiator}
        onEndCall={onEndCall}
        isAudioCall={isAudioCall}
      />
    </div>
  );
}

export default FPCallApp;
