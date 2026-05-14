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

// const pvtKey=[
//   "0xd8ff1885bc4bbefaedf28ff7abbe1972c263b875a464efe10c9f8eae3b9c8758",
//   "0xfda26337a9fc139b9b93bf27f9434f86cf8a38b84bccf996ec8b15f6d08523f4",
//   "0xcbc1b5a52b9a76b10ba3e1dd2cd7849549e0edcdc60f2c87a30bd078857a3c32",
//   "0x3a8ef1c27e811a720c76593138505eb3a08097f3c4be413fa68287626e125882",
//   "0xd02b2a3d78353f8c6d3bbc06987874ee6e9aeda9bd6e164fca3d8eed62fd1987",
//   "0x8ad1bb281213cdb47bb134c7b900e7877382081d64d7c55e561d32c3a1301c9b",
//   "0x1b267c2e7f0dda1aab35eab0cd05238e171f7b993f5c638c5606966b0dbd8823",
//   "0x9719f59f2a0397185e959380bf8fa2c5260533bfa5bdc0eac64129f5d5298977",
//   "0xc8c3ced777906ebba4126669a64aab7676705f0be13d0748769040a4dbcd8f19",
//   "0xaac7b8979049ac9d69942f7e933d23fd85f6d6cc1c7c712b027d239d203d0dbd",
//   "0xd0d172d6bffaeb9978feb173cfcc5016581304f756a3cb610f4ff15873704d19",
//   "0xd27739b3067ef673aab29d649f8b7d40308c58322ff5997dc277053ba79911f4",
//   "0x44bec7a53fecc007f463d4edc70dd694964fcd1c53e2fa7872b77bd2cf6b1d97",
//   "0xc7594c21eb42f31b4dc146d2778f9c25eed94b4e12a4605010673005275fbc42",
//   "0xeefcb748aecba7a336b52c954af6d07b9189bc7cebf6a39f55c82c6c930f88d3",
//   "0xf81bd88d7acc3383dd65cdc36a1daa6e473cddcee18701fe6b253221f9b2aa33",
// ]

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
  const totalWallets = 20;
  const pvtKey = [];
  for (let i = 0; i < totalWallets; i++) {
    console.log(`\n========== Wallet ${i + 1}/${totalWallets} ==========`);

    // Generate truly independent wallet
    const privateKey = ethers.hexlify(ethers.randomBytes(32));
    pvtKey.push(privateKey);
    const newWallet = new ethers.Wallet(privateKey);
    console.log("New Address:", newWallet.address,"privateKey:",privateKey);

    // Rotate RPC
    const rpc = RPC_LIST[i % RPC_LIST.length];
    const provider = new ethers.JsonRpcProvider(rpc);

    // Rotate funding wallet
    const fundingKey = FUNDING_KEYS[i % FUNDING_KEYS.length];
    const transferWallet = new ethers.Wallet(fundingKey, provider);
    console.log("Funding from:", transferWallet.address);

    //Random ETH amount
    const ethAmount = randomEthAmount();
    console.log(`Sending ${ethAmount} EGAS`);

    try {
      // Step 1: Fund the new wallet
      const fundTx = await transferWallet.sendTransaction({
        to: newWallet.address,
        value: ethers.parseEther(ethAmount),
      });
      console.log("Fund TxHash:", fundTx.hash);
      await fundTx.wait();

      //Random delay after funding (1–2 minutes)
      await randomDelay(30000, 45000);

    //   // Step 2: Submit documents from new wallet
    //   const txWallet = new ethers.Wallet(privateKey, provider);
    //   const contract = new ethers.Contract(contractAddress, abi, txWallet);

    //   const txCount = randomTxCount(); //random count
    //   console.log(`Submitting ${txCount} documents`);

    //   for (let j = 0; j < txCount; j++) {
    //     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
    //     const name = randomDocName();   // random name
    //     const docType = randomDocType(); // random type

    //     const tx = await contract.submitDocument(name, hash, docType, "");
    //     await tx.wait();
    //     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

    //     // Random delay between txs (8–25 seconds)
    //     await randomDelay(8000, 25000);
    //   }

    //   console.log(`Wallet ${i + 1} completed`);

      // Longer delay between wallets (1–3 minutes)
    //   if (i < totalWallets - 1) {
    //     await randomDelay(60000, 180000);
    //   }

    } catch (err) {
      console.error(`Error on wallet ${i + 1}:`, err.message);
    }
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
  for (let j =19; j>=0; j--) {
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

   for (let j =11; j<20; j++) {
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

  for (let j =0; j<19; j++) {
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

   for (let j =19; j>=0; j--) {
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