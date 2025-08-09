import { useEffect, useRef } from "react";
import { useWS } from "./ws/WSProvider.js";
import { createMessageRouter } from "./ws/messageRouter.js";

// Adjust these imports to your actual schema file:
import { UserLogin, UserLoginAck } from "@circuit/protocol";
import type { OutboundMessage } from "./lib/ws/messageTypes.js";

const FID = 1768; // pick your fid source

export default function App() {
  const { ready, status, on, send, reconnectNow, close } = useWS();
  const bootedRef = useRef(false);

  useEffect(() => {
    const router = createMessageRouter(on);

    // Route: user.login:ack
    const offAck = router.handle(UserLoginAck, (msg) => {
      console.log("Login ACK for fid:", msg.fid);
      // You can kick off subscriptions or initial fetches here
    });

    return () => {
      offAck();
    };
  }, [on]);

  // Startup: send user.login once the socket is ready
  useEffect(() => {
    if (!ready || bootedRef.current) return;

    // Validate our outbound payload against the same schema before sending (optional)
    const loginMsg = UserLogin.parse({ type: "user.login", fid: FID });
    send(loginMsg as unknown as OutboundMessage);

    bootedRef.current = true;
  }, [ready, send]);

  // If the socket fully closes, allow a fresh startup send next open
  useEffect(() => {
    if (status === "closed") bootedRef.current = false;
  }, [status]);

  return (
    <main style={{ fontFamily: "Inter, system-ui, Arial", padding: 16 }}>
      <h1>WS App</h1>
      <div>
        Status: <strong>{status}</strong> {ready ? "✅" : "⏳"}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => send({ type: "user.login", fid: FID } as OutboundMessage)}
          disabled={!ready}
        >
          Send Login
        </button>
        <button onClick={reconnectNow}>Reconnect</button>
        <button onClick={close}>Close</button>
      </div>
    </main>
  );
}





// import { sdk } from "@farcaster/frame-sdk";
// import { useEffect } from "react";
// import { useAccount, useConnect, useSignMessage } from "wagmi";

// function App() {
//   useEffect(() => {
//     sdk.actions.ready();
//   }, []);

//   return (
//     <>
//       <div>Mini App + Vite + TS + React + Wagmi</div>
//       <ConnectMenu />
//     </>
//   );
// }

// function ConnectMenu() {
//   const { isConnected, address } = useAccount();
//   const { connect, connectors } = useConnect();

//   if (isConnected) {
//     return (
//       <>
//         <div>Connected account:</div>
//         <div>{address}</div>
//         <SignButton />
//       </>
//     );
//   }

//   return (
//     <button type="button" onClick={() => connect({ connector: connectors[0] })}>
//       Connect
//     </button>
//   );
// }

// function SignButton() {
//   const { signMessage, isPending, data, error } = useSignMessage();

//   return (
//     <>
//       <button type="button" onClick={() => signMessage({ message: "hello world" })} disabled={isPending}>
//         {isPending ? "Signing..." : "Sign message"}
//       </button>
//       {data && (
//         <>
//           <div>Signature</div>
//           <div>{data}</div>
//         </>
//       )}
//       {error && (
//         <>
//           <div>Error</div>
//           <div>{error.message}</div>
//         </>
//       )}
//     </>
//   );
// }

// export default App;
