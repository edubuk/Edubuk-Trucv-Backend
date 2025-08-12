// const puppeteer = require('puppeteer');
// (async () => {
//   const browser = await puppeteer.launch({
//     headless: 'new',
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   });

//   const page = await browser.newPage();

//   const resumeUrl = 'http://localhost:5173/new-cv/Ajeet-Verma-9S6QS93JW1kUgV4k';
//   await page.goto(resumeUrl, {
//     waitUntil: 'networkidle0',
//   });

//   // Wait for your resume section
//   const resumeSelector = '#cv-preview-wrapper';
//   await page.waitForSelector(resumeSelector);

//   // Get bounding box of resume container
//   const rect = await page.$eval(resumeSelector, el => {
//     const { x, y, width, height } = el.getBoundingClientRect();
//     return { x, y, width, height };
//   });

//   // Set viewport to full page height
//   await page.setViewport({
//     width: Math.ceil(rect.x + rect.width),
//     height: Math.ceil(rect.y + rect.height),
//   });

//   // Generate cropped PDF using `clip`
//   await page.pdf({
//     path: 'Ajeet-Verma-Resume.pdf',
//     printBackground: true,
//     clip: {
//       x: rect.x,
//       y: rect.y,
//       width: rect.width,
//       height: rect.height,
//     },
//   });

//   console.log('✅ Cropped resume PDF generated: Ajeet-Verma-Resume.pdf');

//   await browser.close();
// })();

const puppeteer = require('puppeteer');

async function renderOnlyCvSection() {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();

    try {
        await page.goto("http://localhost:5173/new-cv/Ajeet-Verma-9S6QS93JW1kUgV4k", { waitUntil: 'networkidle0' });

        await page.waitForSelector("#cv-preview-wrapper");

        const element = await page.$("#cv-preview-wrapper"); // get element handle
        if (!element) {
            throw new Error(`Element not found: #cv-preview-wrapper`);
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

        await page.pdf({
            path:  'clean-section.pdf',
            //format: 'A4',
            //width: '8.27in',       // A4 width
            width: `${Math.ceil(box.width)}px`,
            height: `${Math.ceil(box.height)+10}px`,
            printBackground: true
        });

        console.log('PDF created of CV section only!');
    } catch (e) {
        console.error('Failed to create clean section-only PDF', e);
    } finally {
        await browser.close();
    }
}

renderOnlyCvSection();



