import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  toHex,
  stringToBytes,
  type Hex,
  
} from "viem";
import { v4 as uuidv4 } from "uuid";
import { INTENT_ABI } from "./helper/abi";
import { Constants } from "./helper/constants";
import { paymasterData } from "./utils/generatePaymasterData";
import { nonceToBigInt } from "./helper/nonceToBigInt";
import {
  signUserOp,
  executeUserOp,
  type SessionConfig,
  getUserOperationGasPrice,
} from "./utils/invokeExecuteUserOp";

import { getChains } from "./explorer/getChains";
//import type { Address } from "./helper/types.js";
import { Request, Response } from "express";
import { SessionKey } from "./sessionKey";
import { oktoAuthTokenGenerator } from "./utils/oktoAuthTokenGenerator";
const clientSWA =process.env.OKTO_CLIENT_SWA as Hex;

console.log("clientswa",clientSWA);
interface EVMRawTransaction {
  from: string;
  to: string;
  data?: string;
  value?: string;
}

interface Data {
  caip2Id: string;
  transaction: EVMRawTransaction;
}

/**
 * EvM Raw Transaction Intent: this function executes the raw transaction between addresses.
 * For more information, check https://docs.okto.tech/docs/openapi/evmRawTransaction
 *
 * @param data - The parameters for transferring the Raw Transaction (caip2Id, transaction)
 * @param sessionConfig - The sessionConfig object containing user SWA and session keys.
 * @returns The jobid for the NFT transfer.
 */
export const rawTransaction = async(req:Request,res:Response)=> {
  try{
  //const OktoAuthToken = await oktoAuthTokenGenerator();
  const {txData,caip2Id}= req.body; 
        const data: Data = {
        caip2Id: caip2Id, // eg. POLYGON_TESTNET_AMOY
        transaction: {
          from: `${process.env.OKTO_TWA}`, // TWA
          to: `${process.env.Contract_Add}`, // NFT contract address
          data: txData, // Default empty data
          value: "0x00", // Default value of 0
        },
      };
    const treasuryAPIkey =process.env.OKTO_Treasury_API_KEY;
    const userSWA =process.env.OKTO_TSWA as Hex;
    const session = SessionKey.fromPrivateKey(treasuryAPIkey);
    const sessionConfig: SessionConfig = {
      sessionPrivKey: session.privateKeyHexWith0x,
      sessionPubkey: session.uncompressedPublicKeyHexWith0x,
      userSWA: userSWA,
    };
 
   console.log("session config:",sessionConfig);
  const OktoAuthToken = req.headers["authorization"]?.split(" ")[1] as string; // expects 'Bearer <token>'
  if(!OktoAuthToken || !data.caip2Id || !data.transaction || !data.transaction.from || !data.transaction.to) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters: OktoAuthToken, caip2Id, or transaction details.",
    });
  }
  console.log("OktoAuthToken:", OktoAuthToken);
  // Generate a unique UUID based nonce
  const nonce = uuidv4();

  // Get the Intent execute API info
  const jobParametersAbiType = "(string caip2Id, bytes[] transactions)";
  const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

  // get the Chain CAIP2ID required for payload construction
  // Note: Only the chains enabled on the Client's Developer Dashboard will be shown in the response
  const chains = await getChains(OktoAuthToken);

  const currentChain = chains.find(
    (chain: any) => chain.caip_id === data.caip2Id
  );
console.log("currentChain:", data.caip2Id);
  if (!currentChain) {
    throw new Error(`Chain Not Supported`);
  }

  // feePayerAddress is not provided, it is set default value '0x0000000000000000000000000000000000000000
    const feePayerAddress = Constants.FEE_PAYER_ADDRESS;
  

  //console.log("feePayerAddress:", feePayerAddress);
  //console.log("current chain:", currentChain);

  // create the UserOp Call data for raw txn execute intent
  const calldata = encodeAbiParameters(
    parseAbiParameters("bytes4, address,uint256, bytes"),
    [
      Constants.EXECUTE_USEROP_FUNCTION_SELECTOR, //execute userop function selector
      Constants.getEnvConfig().JOB_MANAGER_ADDRESS, //The Job Manager address is now replaced with "RawTransactionBloc" address
      Constants.USEROP_VALUE,
      encodeFunctionData({
        abi: INTENT_ABI,
        functionName: Constants.FUNCTION_NAME,
        args: [
          toHex(nonceToBigInt(nonce), { size: 32 }),
          clientSWA,
          sessionConfig.userSWA,
          feePayerAddress,
          encodeAbiParameters(
            parseAbiParameters("(bool gsnEnabled, bool sponsorshipEnabled)"),
            [
              {
                gsnEnabled: currentChain.gsn_enabled ?? false,
                sponsorshipEnabled: currentChain.sponsorship_enabled ?? false,
              },
            ]
          ),
          encodeAbiParameters(parseAbiParameters(gsnDataAbiType), [
            {
              isRequired: false,
              requiredNetworks: [],
              tokens: [],
            },
          ]),
          encodeAbiParameters(parseAbiParameters(jobParametersAbiType), [
            {
              caip2Id: data.caip2Id,
              transactions: [
                toHex(stringToBytes(JSON.stringify(data.transaction))),
              ],
            },
          ]),
          Constants.INTENT_TYPE.RAW_TRANSACTION,
        ],
      }),
    ]
  );

  const gasPrice = await getUserOperationGasPrice(OktoAuthToken);

  // Construct the UserOp with all the data fetched above, sign it and add the signature to the userOp
  const userOp = {
    sender: sessionConfig.userSWA,
    nonce: toHex(nonceToBigInt(nonce), { size: 32 }),
    paymaster: Constants.getEnvConfig().PAYMASTER_ADDRESS, //paymaster address
    callGasLimit: toHex(Constants.GAS_LIMITS.CALL_GAS_LIMIT),
    verificationGasLimit: toHex(Constants.GAS_LIMITS.VERIFICATION_GAS_LIMIT),
    preVerificationGas: toHex(Constants.GAS_LIMITS.PRE_VERIFICATION_GAS),
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    paymasterPostOpGasLimit: toHex(
      Constants.GAS_LIMITS.PAYMASTER_POST_OP_GAS_LIMIT
    ),
    paymasterVerificationGasLimit: toHex(
      Constants.GAS_LIMITS.PAYMASTER_VERIFICATION_GAS_LIMIT
    ),
    callData: calldata,
    paymasterData: await paymasterData({
      nonce,
      validUntil: new Date(Date.now() + 6 * Constants.HOURS_IN_MS),
    }),
  };
   console.log("userop:",userOp);
  const signedUserOp = await signUserOp(userOp, sessionConfig);

  // Execute the userOp
  const jobId = await executeUserOp(signedUserOp, OktoAuthToken);
  console.log("JobId: ", jobId);
  if(jobId)
  {
    res.status(200).json({
      success: true,  
      message: "Raw Transaction Intent executed successfully.",
      jobId: jobId,
    })
  }  
}catch (error) {
    //console.error("Error executing raw transaction:", error);
    res.status(500).json({
      success: false,
      message: "Error while executing raw transaction",
      error: error instanceof Error ? error.message : "Unknown error",
    });
}
  
}

