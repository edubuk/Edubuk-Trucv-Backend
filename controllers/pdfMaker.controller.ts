import puppeteer from "puppeteer";
import { Request,Response } from "express";
import User from "../models/userCV.model";

  export async function pdfMakerController(req: Request, res: Response) {
    const { url, selector,loginMailId } = req.body;
    if (!url || !selector) {
      return res.status(400).json({ success:false,message: 'URL and selector are required.' });
    }

      const user = await User.findOne({email:loginMailId});
      if(!user)
      {
        return res.status(404).json({success:false,message:"User not found"})
      }
      if(user.subscriptionPlan !== "Pro")
      {
        return res.status(401).json({success:false,message:"User is not a pro user"})
      }
      const browser = await puppeteer.launch({headless:true});
      const page = await browser.newPage();
  
      try {
          await page.goto(url, { waitUntil: 'networkidle0' });
  
          await page.waitForSelector(selector);
  
          const element = await page.$(selector); // get element handle
          if (!element) {
              throw new Error(`Element not found: ${selector}`);
          }
  
          const html = await page.evaluate(el => el.outerHTML, element); // get HTML from handle
          const box = await element.boundingBox(); // now this works
          // Load the selected section in a fresh blank page
          await page.setContent(`
            <html>
              <head>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Times New Roman', Times, serif;
                  }
                </style>
              </head>
              <body>${html}</body>
            </html>
          `, { waitUntil: 'networkidle0' });
  
          const pdfBuffer = await page.pdf({
            width: `${Math.ceil(box?.width || 794)}px`,
            height: `${Math.ceil(box?.height || 1122)+8}px`,
            printBackground: true
        });


    //console.log('Buffer valid:', Buffer.isBuffer(pdfBuffer), 'Size:', pdfBuffer.length);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).end(pdfBuffer); // use .end() not .send()
  
          console.log('PDF created of CV section only!');
      } catch (e) {
          console.error('Failed to create clean section-only PDF', e);
      } finally {
          await browser.close();
      }
  }
  
