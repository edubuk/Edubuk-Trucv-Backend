import { Request, Response } from "express";

export const verifyProfile = async (req: Request, res: Response) => {
    try {
        const { trucvId } = req.body;
        const data = await fetch("https://trucv-ai-apim.azure-api.net/verification/VerifyCV",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "3e08ad33f2894d6da82e9f25e575794d",
          },
          body: JSON.stringify({
            "trucvId": trucvId
          }),
        })
        const result = await data.json();
        res.status(200).json({
            success: true,
            message: "Profile verified successfully",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}