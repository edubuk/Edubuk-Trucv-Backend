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
  "https://rpc2.eniac.network"
];

// "https://rpc1.eniac.network",
//   "https://rpc2.eniac.network",
//   "https://jp.eniacrpc.net",
// Multiple funding wallets (different sources ideally)
const FUNDING_KEYS = [
  "0e3bf98bb66683ce345131babf06d85b53fef7ba612cb17ec0e5fb21233212d7",
  "17ce46facd5d8f0902a409c020d255de514c0433283c9916ddbce5f08fcac80a",
];

// const pvtKey = [
// "c68636833efaf4fe9aa546564bb308759ed16117bf7b7eb962fc685391046e91",
//   "1d3569fe2736dd602b76fc0c79984eeff825e071a942ef78b0aa30784118dcdd",
//   "fc5da560e268308a8670608a3b2d78d5423d61bed2d6a573a1dd1e2d4b8b6843",
//   "b4ab6a72909a69dc67033bdd182cdf79eb3b4cad4c239031662eb6c69af57547",
//   "0ea1562ab12b57f1f3d4cf9065a41a16ae1e10e7553780b22e807197d8c7b125",
//     "c3d7bf23add9ffd944fdbee07154ad0630804a67c6bb864ef1af1124b4481ded",
//  "1e8981ce688b04f062d47765b1337e691f62ca0ef5705fb2f5d0ea42cf47114e",
//  "ca9d0a7f9cc227068227d3ab5970dbc7b104be155a67f27ab13388812ffb1b2d",
 // "a2bba4ce074980fbbe500ed3c3d55801ea67728517e210e4abbf01959e7fabb6",
 // "42fae23651849b67c6f5605ac68e577a851d86a61f306df8251f06080bb6d2f9",
//  "9a760988efb1d7650a825c344163d6a1ecd5181f50596fd43d331f6c743ea835",
// "9d4c05342a27eab7983bb79ae70d6921160acd317d915a73a5b4b5e79e88c94a",
//   "299f6111731f31858c15f2203109efeb32be8e4158b203a08dbd055c88fa0b15",
//   "a9d36730187abbd1ddc101c9950571339d746dbda43cd956128f070e547ad087",
//   "2bb3751664b3f3b1ef560e39810a99e974362046c774f81fba5f2d70e6d2550a",
//   "54f77d18b3b3c555b8580e0b12b6284b0bf81dfe463c0a8355ba619595b4a52d",
//   "921e7c089a2405276d1c3387f7ad36c0a699798960b4a0c6e92b19e0865cf7aa",
// "2e037c24189c0baafc190282b020510b1105939dd592f53ba15fbe05e1e8c02d",
// "dda6b0f255cb0ecf0d29e10fc173df0c3e724c2e48329bfc013975c8cb3db9dd",
// "bef1b5daee08c29374796c1cda7729e0e1d396a1a1eb4b13b402110f761dbe54",
// "485a16ba5b8edb9b8070e5cf24d8d91112ddd7d4527c3d28d757742495c4b431",
// "1884d3373a645696d060eb7edc2bddc1d3a2f571cdd82bdec62190d30c4066bf",
// "594af7faad47cc315442c44e8d3c93540e68ea7ab4ca3c081babf8ed5232acdb",
// "04d7a5b4f2200c0e9d7fdb05edceec32c6b58c151c5b1c32785feea6b198748c",
// "72d790117697a0052a0f81091fd017e1c5d8fc29f5c8d69401bec58d6e365de3",
// "3795a47f3a1a3bf9d64d67ac9b13ca6b6dd617e90eeed6c804b15faa3750eb3b",
// "336cbdaa8676e34dcf38350e8592f0127f4d6aaa53efd288878517f98605cfbd",
// "ec38974298c92b07c9fcc7e537e68381ee694897596f2ea8b85466137dc453ef",
// de4de2c2fd1a9a46c617e1174151073abd9443af3e30450ace56f6ff31ffadde,
// 5b8509d4da876b212353d7559a5f6bd5c047565a899caf20c1b2d7adbb184468,
// 3db8ae398ca59fb92c7b06fbc09ea68ad7c379c8dca0cbb5d9b994bd48d5ae46,
// 50e515ab9b8503cc7a254b82dad3fa0e1903ceda528d79e8567ae89b02911756,
// fbc6a2f9ce501b7cd26aa2597693597c423322d69bd3ecda8c598137b815b04f,
// 4c3a4943ffaa6e28a265aac0d741ccda89050e8b7a6503878ecb40f55e241b29,
// 4cc22093cc63847c2b26101620c2ce032d8bd70b921c1395b7ce538959fbdc47,
// 553ca5bc03b7fa5d889ab424fc39af18eb708548485de8738bedd461d5a445d0,
// 3b9d52b922739038b6ef93f67a645d99edf66411b9a907af871af1d8dda94b58,
// db568d913b8400ff995ca512b7b0a3410edc7c9ec215e4eed14a32340603607a,
// 13c010912e5aaf18609cd96ce8e9840d539059b852df766ca0db046fb206b849,
// 5c8542c49d1697ebd223a4775b23bb644acde13fcab74cb70c0c7b1f481a1f51,
// d2395591bc839412bce3997671bfce7afeb524deb840e9631871ec88be45c326,
// f8bfe030faac6c8030a11ba765c67a51cfdac7496a4df3acfe2e4a93b8dd8a85,
// d1c60f8cea1b3cdaf8357dda4b6cea985997a7f576f21636c77e2d879a76bc26,
// 8702fa6f14f02712e543e38039a2da119170187fc7f3f425791921e95924aa03,
// 9247e85bb85aebdfe7daaea4c4387ca0db6be7c5cd6342f8e34ed5713fd01a20,
// 1482c648e8443cb8c0aa90a49b83ca92c6a15bde60b8a3bbd5f9c53b8e05709b,
// b5d1bd0d14fbe70781b38d24c47ecd2478fd75ce005cfd804f83e9f5e0989187
// f606805d180f643f7b84a2177b7046c85e9fffca60857438fa2428262a39c1a0
// f31a3fdad9e8777224ceb7fe6aef4ccf051fa9f0048d975c3d5b3ccdffd19718
// 25a130c1bfe9f40f6a085ae9a395b5f34b417d76e8fd15388dd347e74f5e2769
// 546063d2ca17fd021f1f8fbcb7d10c939b938137aca1f17ac1e963eb9b5e6c6d
// 6767ac07bec009c58f8cfc6590f0c9a3e40c2fd7d6cd57c0c4ce709f4d7be01b
// 436b27cb937997354c7658b84a70585822d7b960fa52c30e9a7b243ea9420c25
// 8ad1b699ce5e514541c0e8feb6535c8c9a10640bfa11bb5f3e0574eeca53d5ce
// 55f5ee454c128b771ae6a46bb608edf3d57d1340fabe8ba50832be722deb8e66
// e3ac2370946d86e92360a465ce9b967c73531b75fd7babaa584d7b43e6d48e1e
// ];



// const pvtKey = [
//     "378c79e3b426cbf620e0be92d4e0c86f6208f3efef916016ca0dd140349bf2c1",
//     "b1cf43292f73051041435884ccb0ba0e5f49535bf2388bf50d750c2a81f10c7e",
//     "ab4afa351aa032da1d373b0a50b50f47ec29fa38bc2bd16a6994c55b219a9afa",
//     "ab4afa351aa032da1d373b0a50b50f47ec29fa38bc2bd16a6994c55b219a9afa",
//     "378c79e3b426cbf620e0be92d4e0c86f6208f3efef916016ca0dd140349bf2c1",
//     "caa28e42b420abefca65e27f51baed9dacbfe5babcf3cc5b72f3e22655f61212",
//     "3012234803aa4668fa492f0ba9eb29255db648630c6b4a7f03c2da667e811c4b",
//     "378c79e3b426cbf620e0be92d4e0c86f6208f3efef916016ca0dd140349bf2c1",
//     "caa28e42b420abefca65e27f51baed9dacbfe5babcf3cc5b72f3e22655f61212",
//     "3012234803aa4668fa492f0ba9eb29255db648630c6b4a7f03c2da667e811c4b",
//     "b1cf43292f73051041435884ccb0ba0e5f49535bf2388bf50d750c2a81f10c7e",
//     "b22425b9331219e1aff747fe6c080761b2d1043130f8b28a353864e0d324ab7f",
//     "3012234803aa4668fa492f0ba9eb29255db648630c6b4a7f03c2da667e811c4b",
//     "2d4a91937a7754c9c47d783dfbaa1ef4677a4e49acd4f4440a30bd1a749f9fdd",
//     "b22425b9331219e1aff747fe6c080761b2d1043130f8b28a353864e0d324ab7f",
//     "b1cf43292f73051041435884ccb0ba0e5f49535bf2388bf50d750c2a81f10c7e",
//     "caa28e42b420abefca65e27f51baed9dacbfe5babcf3cc5b72f3e22655f61212",
//     "b22425b9331219e1aff747fe6c080761b2d1043130f8b28a353864e0d324ab7f",
//     "85bb8b4321065f376c0c5b7157b1bc91020be7ed0a020bf2bff3252f6af11cf4",
//     "c07e46bf1b61f397c0109b4f01b6657b0595c4c53e7f3fb33b435fcd9e9b497b",
//     "2d4a91937a7754c9c47d783dfbaa1ef4677a4e49acd4f4440a30bd1a749f9fdd",
//     "85bb8b4321065f376c0c5b7157b1bc91020be7ed0a020bf2bff3252f6af11cf4",
//     "caa28e42b420abefca65e27f51baed9dacbfe5babcf3cc5b72f3e22655f61212",
//     "b22425b9331219e1aff747fe6c080761b2d1043130f8b28a353864e0d324ab7f",
//     "9588d00a6ae15aed2f2dd787ebbd64de25bb69be0802406d3055c6cd3acdfcf2",
//     "c07e46bf1b61f397c0109b4f01b6657b0595c4c53e7f3fb33b435fcd9e9b497b",
//     "b1cf43292f73051041435884ccb0ba0e5f49535bf2388bf50d750c2a81f10c7e",
//     "b7554941cb9c3a32651946c2d933e40e954f59b8af986f126caf69e48d160480",
//     'b7554941cb9c3a32651946c2d933e40e954f59b8af986f126caf69e48d160480',
//     "0646dc3a909bdde2a351c9176c70e204086f5ab63a62ccb107bdf4ecfbce36b2",
//     "d67f7d26ea42620a5d3df8b21804e41cfc018e66d76b326cd039ee16636c15da",
//     "c0cb280ac2b54a83c63c74f1d190bef27bc6a18d0b785d530f08820b0fdea277",
//     "3012234803aa4668fa492f0ba9eb29255db648630c6b4a7f03c2da667e811c4b",
//     "c07e46bf1b61f397c0109b4f01b6657b0595c4c53e7f3fb33b435fcd9e9b497b",
//     "c0cb280ac2b54a83c63c74f1d190bef27bc6a18d0b785d530f08820b0fdea277",
//     "c07e46bf1b61f397c0109b4f01b6657b0595c4c53e7f3fb33b435fcd9e9b497b",
//     "d67f7d26ea42620a5d3df8b21804e41cfc018e66d76b326cd039ee16636c15da",
//     "b7554941cb9c3a32651946c2d933e40e954f59b8af986f126caf69e48d160480",
//     "0646dc3a909bdde2a351c9176c70e204086f5ab63a62ccb107bdf4ecfbce36b2",
//     "c0cb280ac2b54a83c63c74f1d190bef27bc6a18d0b785d530f08820b0fdea277",
//     "9588d00a6ae15aed2f2dd787ebbd64de25bb69be0802406d3055c6cd3acdfcf2",
//     "ab4afa351aa032da1d373b0a50b50f47ec29fa38bc2bd16a6994c55b219a9afa",
//     "0646dc3a909bdde2a351c9176c70e204086f5ab63a62ccb107bdf4ecfbce36b2",
//     "9588d00a6ae15aed2f2dd787ebbd64de25bb69be0802406d3055c6cd3acdfcf2",
//     "ab4afa351aa032da1d373b0a50b50f47ec29fa38bc2bd16a6994c55b219a9afa",
//     "0646dc3a909bdde2a351c9176c70e204086f5ab63a62ccb107bdf4ecfbce36b2",
//     "85bb8b4321065f376c0c5b7157b1bc91020be7ed0a020bf2bff3252f6af11cf4",
//     "ba6dc77b52d03a1a68f7e66abdda7e9ba7394080fb32fc87b4d29e23bcc0a3a7",
//     "d56edd201f629e4e408bc554e77ee2d20188e461a6dc3d5440387b203618d73e",
//     "b7554941cb9c3a32651946c2d933e40e954f59b8af986f126caf69e48d160480",
//     "85bb8b4321065f376c0c5b7157b1bc91020be7ed0a020bf2bff3252f6af11cf4",
//     "1363240597b42d88b58b1c8b7dfecae3f22d19bac283fa991b32cc652adef48b",
//     "9588d00a6ae15aed2f2dd787ebbd64de25bb69be0802406d3055c6cd3acdfcf2",
//     "2d4a91937a7754c9c47d783dfbaa1ef4677a4e49acd4f4440a30bd1a749f9fdd",
//     "d56edd201f629e4e408bc554e77ee2d20188e461a6dc3d5440387b203618d73e",
//     "d56edd201f629e4e408bc554e77ee2d20188e461a6dc3d5440387b203618d73e",
//     "ba6dc77b52d03a1a68f7e66abdda7e9ba7394080fb32fc87b4d29e23bcc0a3a7",
//     "2d4a91937a7754c9c47d783dfbaa1ef4677a4e49acd4f4440a30bd1a749f9fdd",
//     "1363240597b42d88b58b1c8b7dfecae3f22d19bac283fa991b32cc652adef48b",
//     "bb4ff43ab816dc90549c272dd41e1993bfa0416ef3849c146be04ad15e32b226",
//     "d67f7d26ea42620a5d3df8b21804e41cfc018e66d76b326cd039ee16636c15da",
//     "378c79e3b426cbf620e0be92d4e0c86f6208f3efef916016ca0dd140349bf2c1",
//     "b7c8a8ba39b3ce578a5cfa3f49ddab5d6ebf0230e6a9f18b32f07732065b3c81",
//     "ba6dc77b52d03a1a68f7e66abdda7e9ba7394080fb32fc87b4d29e23bcc0a3a7",
//     "1363240597b42d88b58b1c8b7dfecae3f22d19bac283fa991b32cc652adef48b",
//     "ba6dc77b52d03a1a68f7e66abdda7e9ba7394080fb32fc87b4d29e23bcc0a3a7",
//     "bb4ff43ab816dc90549c272dd41e1993bfa0416ef3849c146be04ad15e32b226",
//     "5054e7436e6edf21cca987aa66e74fbdb98bb542c9aabca6e825029132cddab7",
//     "b7c8a8ba39b3ce578a5cfa3f49ddab5d6ebf0230e6a9f18b32f07732065b3c81",
//     "bb4ff43ab816dc90549c272dd41e1993bfa0416ef3849c146be04ad15e32b226",
//     "5054e7436e6edf21cca987aa66e74fbdb98bb542c9aabca6e825029132cddab7",
//     "b7c8a8ba39b3ce578a5cfa3f49ddab5d6ebf0230e6a9f18b32f07732065b3c81",
//     "bb4ff43ab816dc90549c272dd41e1993bfa0416ef3849c146be04ad15e32b226",
//     "5054e7436e6edf21cca987aa66e74fbdb98bb542c9aabca6e825029132cddab7",
//     "5054e7436e6edf21cca987aa66e74fbdb98bb542c9aabca6e825029132cddab7",
//     "d56edd201f629e4e408bc554e77ee2d20188e461a6dc3d5440387b203618d73e"
// ]

// const pvtKey =[
//   "5b7861b13fb323f2108b74d3301ddedc0e47b11250892c4a5bfc4f41092338b1",
//   "d31b1494da596a502ddbcd8cdf7d10054f0a8abadddd3d5a872117b5c6d48506",
//   "5b7861b13fb323f2108b74d3301ddedc0e47b11250892c4a5bfc4f41092338b1",
//   "d7316755b0818af402a0432eda9ec5fa32db41be0fd0a1704c5ade8673576ddc",
//   "5b7861b13fb323f2108b74d3301ddedc0e47b11250892c4a5bfc4f41092338b1",
//    "d31b1494da596a502ddbcd8cdf7d10054f0a8abadddd3d5a872117b5c6d48506",
//   "5b7861b13fb323f2108b74d3301ddedc0e47b11250892c4a5bfc4f41092338b1",
//   "d7316755b0818af402a0432eda9ec5fa32db41be0fd0a1704c5ade8673576ddc",
//   "fbd139b73a60109fcc2b9b1249ddbba3d496ac1eb400a009e5e331e14997b5c8",
//   "d31b1494da596a502ddbcd8cdf7d10054f0a8abadddd3d5a872117b5c6d48506",
//   "fbd139b73a60109fcc2b9b1249ddbba3d496ac1eb400a009e5e331e14997b5c8",
//  "d7316755b0818af402a0432eda9ec5fa32db41be0fd0a1704c5ade8673576ddc",
//  "d7316755b0818af402a0432eda9ec5fa32db41be0fd0a1704c5ade8673576ddc",
//   "fbd139b73a60109fcc2b9b1249ddbba3d496ac1eb400a009e5e331e14997b5c8",
//   "d31b1494da596a502ddbcd8cdf7d10054f0a8abadddd3d5a872117b5c6d48506",
//   "fbd139b73a60109fcc2b9b1249ddbba3d496ac1eb400a009e5e331e14997b5c8",
//   "8d4764d0d84811dd4d794e172d0911cf1c8c4824c7e03e76deadaa830640e269",
//   "9371d98ebb4a59dab35c9c2668fb0a05a86c23bf71ad004ddc20847386af8ef2",
//   "8d4764d0d84811dd4d794e172d0911cf1c8c4824c7e03e76deadaa830640e269",
//   "9371d98ebb4a59dab35c9c2668fb0a05a86c23bf71ad004ddc20847386af8ef2",
//   "8d4764d0d84811dd4d794e172d0911cf1c8c4824c7e03e76deadaa830640e269",
//   "9371d98ebb4a59dab35c9c2668fb0a05a86c23bf71ad004ddc20847386af8ef2",
//   "8d4764d0d84811dd4d794e172d0911cf1c8c4824c7e03e76deadaa830640e269",
//   "1a12d48ebad37c14292f9ba1a9a85d63ba047c215d488030b95e36764dcb6e51",
//    "0a6f97f337593cccd8b8ea6c4c2b47b5b32db39c8b45813b4da493d872a4cc69",
//    "0a6f97f337593cccd8b8ea6c4c2b47b5b32db39c8b45813b4da493d872a4cc69",
//   "1a12d48ebad37c14292f9ba1a9a85d63ba047c215d488030b95e36764dcb6e51",
//   "0a6f97f337593cccd8b8ea6c4c2b47b5b32db39c8b45813b4da493d872a4cc69",
//   "1a12d48ebad37c14292f9ba1a9a85d63ba047c215d488030b95e36764dcb6e51",
//   "0a6f97f337593cccd8b8ea6c4c2b47b5b32db39c8b45813b4da493d872a4cc69",
//   "1a12d48ebad37c14292f9ba1a9a85d63ba047c215d488030b95e36764dcb6e51",
//   "a028e9bd1202490c2d15d5a26fd2c4f56123c775727cdaf302f58545a645ede9",
//   "a028e9bd1202490c2d15d5a26fd2c4f56123c775727cdaf302f58545a645ede9",
//   "6a4b9e9beb8de8a10c847e1737ceaa5b27478fd70e996bcabfae558e3409d213",
//   "a028e9bd1202490c2d15d5a26fd2c4f56123c775727cdaf302f58545a645ede9",
//   "6a4b9e9beb8de8a10c847e1737ceaa5b27478fd70e996bcabfae558e3409d213",
//   "a028e9bd1202490c2d15d5a26fd2c4f56123c775727cdaf302f58545a645ede9",
//   "6a4b9e9beb8de8a10c847e1737ceaa5b27478fd70e996bcabfae558e3409d213",
//   "6a4b9e9beb8de8a10c847e1737ceaa5b27478fd70e996bcabfae558e3409d213",
//   "66a546e3cd84244e9a7c7e3b249d7b0aceb4f4843147ba263f09edc47a0e9782",
//   "66a546e3cd84244e9a7c7e3b249d7b0aceb4f4843147ba263f09edc47a0e9782",
//   "4d4e3294c4e11a48ae58f2c1b860a692d17806c581da4ff4377459be5461010c",
//   "4d4e3294c4e11a48ae58f2c1b860a692d17806c581da4ff4377459be5461010c",
//   "4d4e3294c4e11a48ae58f2c1b860a692d17806c581da4ff4377459be5461010c",
//   "66a546e3cd84244e9a7c7e3b249d7b0aceb4f4843147ba263f09edc47a0e9782",
//   "66a546e3cd84244e9a7c7e3b249d7b0aceb4f4843147ba263f09edc47a0e9782",
//   "fa496aad587e0f1c565f960bcdfddaf909d62f14cbf4771f481beec69af321e8",
//   "fa496aad587e0f1c565f960bcdfddaf909d62f14cbf4771f481beec69af321e8",
//   "fa496aad587e0f1c565f960bcdfddaf909d62f14cbf4771f481beec69af321e8",
//   "37980ccbaad704d1d44620a7310f3dcfb0838975520f9aaf6c358f1675add7ca",
//   "37980ccbaad704d1d44620a7310f3dcfb0838975520f9aaf6c358f1675add7ca",
//   "fa496aad587e0f1c565f960bcdfddaf909d62f14cbf4771f481beec69af321e8",
//   "37980ccbaad704d1d44620a7310f3dcfb0838975520f9aaf6c358f1675add7ca",
//   "37980ccbaad704d1d44620a7310f3dcfb0838975520f9aaf6c358f1675add7ca",
//   "b6914853216dad2724c3014b019542ac3c0e78c6031a04d42243f4c36ef08bd0",
//   "e9c82c0483b8e4bab16c790acbdae2b5a14d289be07290be74f1e5ad8be305ec",
//   "b6914853216dad2724c3014b019542ac3c0e78c6031a04d42243f4c36ef08bd0",
//   "e9c82c0483b8e4bab16c790acbdae2b5a14d289be07290be74f1e5ad8be305ec",
//   "e9c82c0483b8e4bab16c790acbdae2b5a14d289be07290be74f1e5ad8be305ec",
//   "e9c82c0483b8e4bab16c790acbdae2b5a14d289be07290be74f1e5ad8be305ec",
//   "b6914853216dad2724c3014b019542ac3c0e78c6031a04d42243f4c36ef08bd0",
//   "acb35bf8de071bd7eec5ea7578177e82a1171ed33c8f6b16f592dfecbfa52e84",
//   "acb35bf8de071bd7eec5ea7578177e82a1171ed33c8f6b16f592dfecbfa52e84",
//   "acb35bf8de071bd7eec5ea7578177e82a1171ed33c8f6b16f592dfecbfa52e84",
//   "acb35bf8de071bd7eec5ea7578177e82a1171ed33c8f6b16f592dfecbfa52e84",
//   "31cc1058844cd31af575ff7c24e576914da8534e9675604e3a91fa7e514f0b44",
//   "31cc1058844cd31af575ff7c24e576914da8534e9675604e3a91fa7e514f0b44",
//   "eaef3af8393c498b6de1e665fb7ad3a709dca43de297e66f783aca92392e6c4d",
//   "eaef3af8393c498b6de1e665fb7ad3a709dca43de297e66f783aca92392e6c4d",
//   "8564444febcabf7595f72ba21b83cff714a5402d2c60126ad65a417cc179de9b",
//   "eaef3af8393c498b6de1e665fb7ad3a709dca43de297e66f783aca92392e6c4d",
//   "8564444febcabf7595f72ba21b83cff714a5402d2c60126ad65a417cc179de9b",
//   "eaef3af8393c498b6de1e665fb7ad3a709dca43de297e66f783aca92392e6c4d",
//   "8564444febcabf7595f72ba21b83cff714a5402d2c60126ad65a417cc179de9b",
//   "31cc1058844cd31af575ff7c24e576914da8534e9675604e3a91fa7e514f0b44",
//   "8564444febcabf7595f72ba21b83cff714a5402d2c60126ad65a417cc179de9b",
//   "31cc1058844cd31af575ff7c24e576914da8534e9675604e3a91fa7e514f0b44",
// ]

const pvtKey = [
  "ba62a20c0168bba14be795c90413052329d500b8317ebf762bd81521b82c5353",
  "a4efe848a6b99ecb1defa85908ba23bc7d29a1297c51fbdd678e47ca0b4eceab",
  "ba62a20c0168bba14be795c90413052329d500b8317ebf762bd81521b82c5353",
  "ba62a20c0168bba14be795c90413052329d500b8317ebf762bd81521b82c5353",
  "a4efe848a6b99ecb1defa85908ba23bc7d29a1297c51fbdd678e47ca0b4eceab",
  "a4efe848a6b99ecb1defa85908ba23bc7d29a1297c51fbdd678e47ca0b4eceab",
  "ba62a20c0168bba14be795c90413052329d500b8317ebf762bd81521b82c5353",
  "a4efe848a6b99ecb1defa85908ba23bc7d29a1297c51fbdd678e47ca0b4eceab"

]
// Randomize delay — human-like behavior
const randomDelay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`Waiting ${(ms/1000).toFixed(1)}s...`);
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Randomize ETH amount slightly
// const randomEthAmount = () => {
//   const base = 0.11;
//   const jitter = (Math.random() * 0.01).toFixed(4); // 0.11 to 0.12
//   return (base + parseFloat(jitter)).toFixed(4);
// };

//  Randomize tx count per wallet (3–4)
const randomTxCount = () => Math.floor(Math.random() * 2) + 3;

// Randomize doc name and type
const DOC_NAMES = ["Certificate", "Diploma", "Transcript", "Badge", "License"];
const DOC_TYPES = ["academic", "professional", "identity", "credential", "award"];
const randomDocName = () => DOC_NAMES[Math.floor(Math.random() * DOC_NAMES.length)];
const randomDocType = () => DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];

const transferToken = async () => {
  const totalWallets = 1;

  for (let i = 0; i < totalWallets; i++) {
    console.log(`\n========== Wallet ${i + 1}/${totalWallets} ==========`);

    // Generate truly independent wallet
    //const privateKey = ethers.hexlify(ethers.randomBytes(32));
    // const privateKey = pvtKey[i];
    //const newWallet = new ethers.Wallet(privateKey);
    //console.log("New Address:", newWallet.address);

    // Rotate RPC
    // const rpc = RPC_LIST[i % RPC_LIST.length];
    //const provider = new ethers.JsonRpcProvider(rpc);

    // Rotate funding wallet
    //const fundingKey = FUNDING_KEYS[i % FUNDING_KEYS.length];
    //const transferWallet = new ethers.Wallet(fundingKey, provider);
    //console.log("Funding from:", transferWallet.address);

    //Random ETH amount
   // const ethAmount = randomEthAmount();
    //console.log(`Sending ${ethAmount} EGAS`);

    try {
      // Step 1: Fund the new wallet
    //   const fundTx = await transferWallet.sendTransaction({
    //     to: newWallet.address,
    //     value: ethers.parseEther(ethAmount),
    //   });
    //   console.log("Fund TxHash:", fundTx.hash);
    //   await fundTx.wait();

      //Random delay after funding (1–2 minutes)
      //await randomDelay(60000, 120000);

      // Step 2: Submit documents from new wallet
      

      const txCount = 8; //random count
      console.log(`Submitting ${txCount} documents`);
      for (let j = 0; j < txCount; j++) {
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
        await randomDelay(30000, 60000);
      }
      console.log(`Wallet ${i + 1} completed`);

      //Longer delay between wallets (1–3 minutes)
      //   if (i < totalWallets - 1) {
    //     await randomDelay(60000, 180000);
    //   }

    } catch (err) {
      console.error(`Error on wallet ${i + 1}:`, err.message);
    }
  }

  console.log("\nAll wallets done!");
};

transferToken();