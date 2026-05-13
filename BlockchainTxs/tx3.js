 const ethers = require("ethers");
 const crypto = require("crypto");
 
 const contractAddress = "0x007aa7830d7E894C312d46389D1bD89144fCf076";
 const abi = [
   {
     inputs: [
       { internalType: "string", name: "name", type: "string" },
       { internalType: "bytes32", name: "hash", type: "bytes32" },
       { internalType: "string", name: "docType", type: "string" },
       { internalType: "string", name: "tokenUri", type: "string" },
     ],
     name: "submitDocument",
     outputs: [],
     stateMutability: "nonpayable",
     type: "function",
   },
 ];
 
 // Rotate RPC endpoints per wallet
 const RPC_LIST = [
   "https://rpc.eniac.network",
   "https://rpc1.eniac.network",
   "https://rpc2.eniac.network",
 ];
 //"17ce46facd5d8f0902a409c020d255de514c0433283c9916ddbce5f08fcac80a",
 // Multiple funding wallets (different sources ideally)
 // const FUNDING_KEYS = [
 //   "0e3bf98bb66683ce345131babf06d85b53fef7ba612cb17ec0e5fb21233212d7",
 //   "17ce46facd5d8f0902a409c020d255de514c0433283c9916ddbce5f08fcac80a",
 // ];
 const FUNDING_KEYS = [
   "3edb0915ba16b57e4eca4ac29f5d8ce0f1d05a569f3db41ad650af8f8f913d6a"
 ];
 
 const pvtKey=[
    "a2e9819bfc42ec70d68d96a4bb4c674cf3b2fe3b4597bfec7483ddf2e80fca66",
    "6e41ff207eb650d21add837574ca452f1b20186b4e0d4617c06ba15afe0ef00e",
    "956c1082899ec8071eca6ef4da71bbc837caffc4a40f5e0fc52131938a27eead",
    "3012894ef5f4f55d008d323c84582460a9f7b729ed8287a2325e08530d08c463",
    "25ef445eb60c4e18acea1c18a3ddff26d2ab6b99423a86bb392980b7462cc216",
    "4601f3227ee119d66f9e650eca97ad970a1512cb85cc1dc60760057fdab93942",
    "fdcec65bbaa896d6b2d5dbc592aa3a8304c060bfa58c0304d288b0ab98fc7ee0",
    "1baeb05a8f21acc13837138d7e8f4af2e331cc6254ea576ca72c1b79a06b8421",
    "b195e299a7f574fe4f9b40235500ec0ce85472b4eb79ba8b3dbe415e881bae58",
    "534c2529edbbfe67a50e35c69ab5ea3b59d57d25813f15602b8586ef84d6f7f8",
    "6dd22c3e4a5b667d53fe290fd8e5c0cbcb73fe4031c5d40dbdbf51c3309ac148",
    "26b3b5d791d492670f9f3bfbd52a92ff57a0d4c5c853527b8ba8d37aacf218fd",
    "7ae2b8f212c44e5100b0b3b4a3b2afea2d22faab10ae675e5708da02dcc29021",
    "2f5945003bad5f882abdd57d80e6db8fed585c3126cc7d14424bbf02dc314120",
    "3d15f5743c7a71c2274210c2e658dcaa01061f4d0c1fbaf9917c05edcde18904",
    "f7114e4d9ea23c68c48ca822958123bc82e0e3901ded0b26a3a91d2840dc806a",
    "e9db69d6857ae124d06cffc22cc1f60ed645c61398a4fb66f676f8dc8d8d04f4",
    "66eee29e8e151ca1c7f2e2bc13833af0b0292121a679058b1e55fb38943b2b34",
 ]
 
 // Randomize delay — human-like behavior
 const randomDelay = (min, max) => {
   const ms = Math.floor(Math.random() * (max - min + 1)) + min;
   console.log(`Waiting ${(ms/1000).toFixed(1)}s...`);
   return new Promise(resolve => setTimeout(resolve, ms));
 };
 
 // Randomize ETH amount slightly
 const randomEthAmount = () => {
   const base = 0.108;
   const jitter = (Math.random() * 0.002).toFixed(4); // 0.108 to 0.113
   return (base + parseFloat(jitter)).toFixed(4);
 };
 
 //  Randomize tx count per wallet (3–5)
 const randomTxCount = () => Math.floor(Math.random() * 3) + 3;
 
 // Randomize doc name and type
 const DOC_NAMES = ["Certificate", "Diploma", "Transcript", "Badge", "License"];
 const DOC_TYPES = ["academic", "professional", "identity", "credential", "award"];
 const randomDocName = () => DOC_NAMES[Math.floor(Math.random() * DOC_NAMES.length)];
 const randomDocType = () => DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];
 
 const transferToken = async () => {
//    const totalWallets = 20;
//    const pvtKey = [];
//    for (let i = 0; i < totalWallets; i++) {
//      console.log(`\n========== Wallet ${i + 1}/${totalWallets} ==========`);
 
//      // Generate truly independent wallet
//      const privateKey = ethers.hexlify(ethers.randomBytes(32));
//      pvtKey.push(privateKey);
//      const newWallet = new ethers.Wallet(privateKey);
//      console.log("New Address:", newWallet.address,"privateKey:",privateKey);
 
//      // Rotate RPC
//      const rpc = RPC_LIST[i % RPC_LIST.length];
//      const provider = new ethers.JsonRpcProvider(rpc);
 
//      // Rotate funding wallet
//      const fundingKey = FUNDING_KEYS[i % FUNDING_KEYS.length];
//      const transferWallet = new ethers.Wallet(fundingKey, provider);
//      console.log("Funding from:", transferWallet.address);
 
//      //Random ETH amount
//      const ethAmount = randomEthAmount();
//      console.log(`Sending ${ethAmount} EGAS`);
 
//      try {
//        // Step 1: Fund the new wallet
//        const fundTx = await transferWallet.sendTransaction({
//          to: newWallet.address,
//          value: ethers.parseEther(ethAmount),
//        });
//        console.log("Fund TxHash:", fundTx.hash);
//        await fundTx.wait();
 
//        //Random delay after funding (1–2 minutes)
//        await randomDelay(30000, 45000);
 
//      //   // Step 2: Submit documents from new wallet
//      //   const txWallet = new ethers.Wallet(privateKey, provider);
//      //   const contract = new ethers.Contract(contractAddress, abi, txWallet);
 
//      //   const txCount = randomTxCount(); //random count
//      //   console.log(`Submitting ${txCount} documents`);
 
//      //   for (let j = 0; j < txCount; j++) {
//      //     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
//      //     const name = randomDocName();   // random name
//      //     const docType = randomDocType(); // random type
 
//      //     const tx = await contract.submitDocument(name, hash, docType, "");
//      //     await tx.wait();
//      //     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
 
//      //     // Random delay between txs (8–25 seconds)
//      //     await randomDelay(8000, 25000);
//      //   }
 
//      //   console.log(`Wallet ${i + 1} completed`);
 
//        // Longer delay between wallets (1–3 minutes)
//      //   if (i < totalWallets - 1) {
//      //     await randomDelay(60000, 180000);
//      //   }
 
//      } catch (err) {
//        console.error(`Error on wallet ${i + 1}:`, err.message);
//      }
//    } 
 

   for (let j =17; j>=0; j--) {
     const rpc = RPC_LIST[j % RPC_LIST.length];
     const provider = new ethers.JsonRpcProvider(rpc);
     const privateKey = pvtKey[j];
     const txWallet = new ethers.Wallet(privateKey, provider);
     console.log("Address:", txWallet.address);
     const contract = new ethers.Contract(contractAddress, abi, txWallet);
     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
     const name = randomDocName();   // random name
     const docType = randomDocType(); // random type
 
     const tx = await contract.submitDocument(name, hash, docType, "");
     await tx.wait();
     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
 
     // Random delay between txs (8–25 seconds)
     await randomDelay(30000, 45000);
   }
 
    for (let j =11; j<18; j++) {
     const rpc = RPC_LIST[j % RPC_LIST.length];
     const provider = new ethers.JsonRpcProvider(rpc);
     const privateKey = pvtKey[j];
     const txWallet = new ethers.Wallet(privateKey, provider);
     console.log("Address:", txWallet.address);
     const contract = new ethers.Contract(contractAddress, abi, txWallet);
     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
     const name = randomDocName();   // random name
     const docType = randomDocType(); // random type
 
     const tx = await contract.submitDocument(name, hash, docType, "");
     await tx.wait();
     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
 
     // Random delay between txs (8–25 seconds)
     await randomDelay(30000, 50000);
   }
 
   for (let j =0; j<18; j++) {
     const rpc = RPC_LIST[j % RPC_LIST.length];
     const provider = new ethers.JsonRpcProvider(rpc);
     const privateKey = pvtKey[j];
     const txWallet = new ethers.Wallet(privateKey, provider);
     console.log("Address:", txWallet.address);
     const contract = new ethers.Contract(contractAddress, abi, txWallet);
     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
     const name = randomDocName();   // random name
     const docType = randomDocType(); // random type
 
     const tx = await contract.submitDocument(name, hash, docType, "");
     await tx.wait();
     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
 
     // Random delay between txs (8–25 seconds)
     await randomDelay(20000, 40000);
   }

    for (let j =0; j < 10; j++) {
     const rpc = RPC_LIST[j % RPC_LIST.length];
     const provider = new ethers.JsonRpcProvider(rpc);
     const privateKey = pvtKey[j];
     const txWallet = new ethers.Wallet(privateKey, provider);
     console.log("Address:", txWallet.address);
     const contract = new ethers.Contract(contractAddress, abi, txWallet);
     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
     const name = randomDocName();   // random name
     const docType = randomDocType(); // random type
 
     const tx = await contract.submitDocument(name, hash, docType, "");
     await tx.wait();
     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
 
     // Random delay between txs (8–25 seconds)
     await randomDelay(30000, 45000);
   }
 
    for (let j =17; j>=0; j--) {
     const rpc = RPC_LIST[j % RPC_LIST.length];
     const provider = new ethers.JsonRpcProvider(rpc);
     const privateKey = pvtKey[j];
     const txWallet = new ethers.Wallet(privateKey, provider);
     console.log("Address:", txWallet.address);
     const contract = new ethers.Contract(contractAddress, abi, txWallet);
     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
     const name = randomDocName();   // random name
     const docType = randomDocType(); // random type
 
     const tx = await contract.submitDocument(name, hash, docType, "");
     await tx.wait();
     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
 
     // Random delay between txs (8–25 seconds)
     await randomDelay(30000, 50000);
   }
 
 
   console.log("\nAll wallets done!");
 };
 
 transferToken();
 
 // 50+15+20+20+20+20