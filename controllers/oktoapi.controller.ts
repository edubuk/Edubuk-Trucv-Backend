import { Request, Response } from "express";
import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv();


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





  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const { intentId, intentType } = req.params;
        console.log("intentId:", intentId, "intentType:", intentType);
        const OktoAuthToken = req.headers["authorization"]?.split(" ")[1]; // expects 'Bearer <token>'
        if (!OktoAuthToken || !intentId || !intentType) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: OktoAuthToken (in headers), intentId, or intentType",
            });
        }

        const response = await axios.get(
            `${process.env.OktoBaseUrl}/api/oc/v1/orders?intent_id=${intentId}&intent_type=${intentType}`,
            {
                headers: {
                    Authorization: `Bearer ${OktoAuthToken}`,
                },
            }
        );

        const items = response.data?.data?.items;
        const currTxStatus = items?.[0]?.status;
        const txHash = items?.[0]?.downstream_transaction_hash;
        console.log("tx status",items?.[0]);
        if (currTxStatus) {
            return res.status(200).json({
                success: true,
                currStatus: currTxStatus,
                txHash:txHash
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No transaction status found",
            });
        }

    } catch (error) {
        console.error("Error while getting order history:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



