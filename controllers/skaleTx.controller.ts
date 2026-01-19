import { Request, Response } from "express"
import { Wallet, ethers } from "ethers"
import { EdubukConAdd, EdubukConABI } from "../utils/constant"
import mongoose from "mongoose"
import { configDotenv } from "dotenv";
import { IGetUserAuthInfoRequest } from "../types/definitionFile";
import { Certification } from "../models/certification.model";
configDotenv;

const Spark_Wallet_Add = process.env.Spark_Wallet_Add;
const SKALE_MAINNET_RPC = process.env.SKALE_MAINNET_RPC;
const Skale_Spark_Private_Key = process.env.Skale_Spark_Private_Key;
console.log("Spark_Wallet_Add", Spark_Wallet_Add);
console.log("SKALE_MAINNET_RPC", SKALE_MAINNET_RPC);

export const createContract = async () => {
    try {
        if (!Skale_Spark_Private_Key) {
            throw new Error("Private key or contract address not found");
        }
        const provider = new ethers.JsonRpcProvider(SKALE_MAINNET_RPC);
        const wallet = new Wallet(Skale_Spark_Private_Key, provider);
        const contract = new ethers.Contract(EdubukConAdd, EdubukConABI.abi, wallet);
        return contract;
    } catch (error: any) {
        console.log(error);
        throw error;
    }
}



export const uploadCertificate = async (req: Request, res: Response) => {
    try {
        console.log("api hitting");
        const { name, uri, filehash, certificateType, issuerName } = req.body;
        const typeReq = req as IGetUserAuthInfoRequest;

        const data = await Certification.findOneAndUpdate(
            { userId: typeReq.user._id },   // filter
            {
                certUrl: uri
            },
            {
                new: true,        // return updated / created document
                upsert: true,     // create if not exists
                setDefaultsOnInsert: true, // apply schema defaults on insert
            }
        );
        // required validation
        if (!name || !certificateType || !issuerName || !filehash || !uri) {
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Name, certificate type, issuer name, file hash, assessment id and uri are required",
                });
        }

        if (!Spark_Wallet_Add || !SKALE_MAINNET_RPC) {
            return res
                .status(500)
                .json({ success: false, message: "Spark wallet address or SKALE RPC not configured" });
        }
        //console.log("parameters", { name, uri, filehash, certificateType, issuerName, Spark_Wallet_Add, SKALE_MAINNET_RPC });
        // create contract and post certificate
        const contract = await createContract();
        const tx = await contract.postCertificate(
            name,
            Spark_Wallet_Add,
            uri,
            filehash,
            certificateType,
            issuerName
        );

        // wait for mining (receipt)
        const receipt = await tx.wait();

        // if tx.hash exists, update the AssessmentResult document
        if (tx && tx.hash) {
            //If assessmentId corresponds to _id in the collectionn

            await Certification.findOneAndUpdate(
                { userId: typeReq.user._id }, 
                {
                    txHash: tx.hash
                }
            );

            return res.status(200).json({
                success: true,
                message: "Certificate uploaded successfully",
                txHash: tx.hash,
                txReceipt: receipt,
            });
        }

        // If no tx.hash (unlikely), return an error
        return res.status(500).json({
            success: false,
            message: "Transaction submitted but no tx.hash was returned",
        });
    } catch (error: any) {
        console.error("uploadCertificate error:", error);
        const msg = error?.message || "Internal server error";
        return res.status(500).json({ success: false, message: msg });
    }
};