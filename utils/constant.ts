//--------------Mainnet configuration---------------//
//0.8.22 compiler version used
//skale calyspo hub mainnet 
export const EdubukConAdd = "0xfcF386Fb19631248177c90A0e09060E0A2d6157a";
export const EdubukConABI = {
	"abi":[
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "studentname",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "studentAdd",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "URI",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "hash",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "_type",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "_witness",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct EdubukEsealer.BulkUploadData[]",
                    "name": "data",
                    "type": "tuple[]"
                },
                {
                    "internalType": "string",
                    "name": "_issuerName",
                    "type": "string"
                }
            ],
            "name": "bulkUpload",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string[]",
                    "name": "failedHashes",
                    "type": "string[]"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "count",
                    "type": "uint256"
                }
            ],
            "name": "BulkUploadFailed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "hash",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "issuerId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "studentname",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "issuerName",
                    "type": "string"
                }
            ],
            "name": "CertificatePosted",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "deleteCertificate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_institute",
                    "type": "address"
                }
            ],
            "name": "deleteInstitute",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_student",
                    "type": "address"
                }
            ],
            "name": "deleteStudentData",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                }
            ],
            "name": "InstituteRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "instituteAddress",
                    "type": "address"
                }
            ],
            "name": "InstituteRevoked",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "witness",
                    "type": "address"
                }
            ],
            "name": "InstituteWitnessUpdated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                }
            ],
            "name": "IssuerRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "OwnerRegistered",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_studentname",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_studentAdd",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "_uri",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_type",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_issuerName",
                    "type": "string"
                }
            ],
            "name": "postCertificate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_instituteName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_ackronynm",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_witness",
                    "type": "address"
                }
            ],
            "name": "registerInstitute",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_institute",
                    "type": "address"
                }
            ],
            "name": "revokeInstitute",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_witness",
                    "type": "address"
                }
            ],
            "name": "revokeWitness",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "studentname",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "studentAdd",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "URI",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "hash",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "_type",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "_witness",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct EdubukEsealer.BulkUploadData[]",
                    "name": "data",
                    "type": "tuple[]"
                }
            ],
            "name": "updateBulkCertificateURI",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_uri",
                    "type": "string"
                }
            ],
            "name": "updateCertificateURI",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_newwitness",
                    "type": "address"
                }
            ],
            "name": "updateWitness",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "issuerId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "witness",
                    "type": "address"
                }
            ],
            "name": "WitnessRegistered",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_witness",
                    "type": "address"
                }
            ],
            "name": "getInstituteID",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getInstituteList",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "instituteName",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "instituteAddress",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct EdubukEsealer.InstituteInfo[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_studentAdd",
                    "type": "address"
                }
            ],
            "name": "getStudentInfo",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "name",
                            "type": "string"
                        },
                        {
                            "internalType": "string[]",
                            "name": "instituteName",
                            "type": "string[]"
                        },
                        {
                            "internalType": "string[]",
                            "name": "uri",
                            "type": "string[]"
                        },
                        {
                            "internalType": "address",
                            "name": "studentAdd",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct EdubukEsealer.Student",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "verifyContractOwner",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "verifyInstitute",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "viewCertificateData",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "viewCertificateURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
}