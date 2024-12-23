const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 5690;

// Function to convert HTML to PNG
async function convertHtmlToPng(htmlContent, outputPath) {
  if (!htmlContent) {
    throw new Error('HTML content must be provided.');
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.setViewport({ width: 1000, height: 1000 }); // Adjust as needed
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
}

// Route to handle HTML to PNG conversion
app.get('/generate-png', async (req, res) => {

    const {query} = req


    if (!query.quote){
        res.status(400).send('Query for quote is missing.'); 
    }

  const content = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Post</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #052431;
      }
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 1000px;
        height: 1000px;
        background-color: #052431;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        padding: 24px;
        box-sizing: border-box;
      }
      .content {
        display: flex;
        flex-direction: column;
      }
      .profile {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 64px;
      }
      .profile img {
        height: 144px;
        width: 144px;
        object-fit: cover;
        border-radius: 50%;
        border: 2px solid white;
      }
      .profile-details {
        margin-left: 20px;
      }
      .profile-details .name {
        color: white;
        font-weight: bold;
        font-size: 40px;
        margin-top: 12px;
      }
      .profile-details .tagline {
        color: #A0AEC0;
        font-size: 24px;
        margin-bottom: 16px;
      }
      .quote {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        justify-content: center;
        text-align: center;
      }
      .quote-text {
        color: white;
        width: 500px;
        word-break: break-word;
        font-size: 40px;
        line-height: 1.5;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="content">
        <div class="profile">
          <img src="https://media.licdn.com/dms/image/v2/D4E03AQE3WpirQLWcwA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1728316490982?e=1740009600&v=beta&t=FGFjKsheaOaiXoLOGA2-eVQ5gSA9O9aqiQSewM87CEY" alt="Profile Picture">
          <div class="profile-details">
            <div class="name">Muqeet Mughal</div>
            <div class="tagline">Tailored ERP & Software Solutions</div>
          </div>
        </div>
        <div class="quote">
          <div class="quote-text">${query.quote}</div>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  const outputPath = 'output.png';

  try {
    await convertHtmlToPng(content, outputPath);
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(outputPath, { root: '.' }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        fs.unlinkSync(outputPath); // Remove the file after sending it
      }
    });
  } catch (error) {
    console.error('Error generating PNG:', error);
    res.status(500).send('An error occurred while generating the PNG.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
