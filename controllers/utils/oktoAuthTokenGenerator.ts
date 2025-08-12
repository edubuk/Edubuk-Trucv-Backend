//import { useOkto } from "@okto_web3/react-sdk";
import { SessionKey } from './sessionKey';
import {getTreasuryWalletAuthorizationToken} from './getTreasuryWalletAuthorizationToken';

export const oktoAuthTokenGenerator = async () => {
  
  const treasuryWalletSWA = "0x9AD23412bE5d0d51b715A888C365b38041377316"; 
  const treasuryAPIkey = "0x2d0a664cfe4b40fdc3c4d23b66430f8f6e944c26920e579ff4b6a263c8d7b148"; 

  // Construct the session object using the private key above
  const session = SessionKey.fromPrivateKey(treasuryAPIkey);

  //construct session config using the session object and userSWA
  const sessionConfig = {
    sessionPrivKey: session.privateKeyHexWith0x,
    sessionPubKey: session.uncompressedPublicKeyHexWith0x,
    treasuryWalletSWA,
  };

  // Get the authorization token using the sessionConfig object
  const authToken = await getTreasuryWalletAuthorizationToken(sessionConfig);
  console.log("Okto session authToken: ", authToken);
 
  return authToken;
};
