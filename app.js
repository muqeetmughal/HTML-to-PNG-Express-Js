const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 5690;

// Function to convert HTML to PNG
async function convertHtmlToPng(htmlContent, outputPath) {
  if (!htmlContent) {
    throw new Error("HTML content must be provided.");
  }
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.setViewport({ width: 1000, height: 1000 }); // Adjust as needed
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
}

// Route to handle HTML to PNG conversion
app.get("/generate-png", async (req, res) => {
  const { query } = req;

  if (!query.quote) {
    res.status(400).send("Query for quote is missing.");
  }

  const content = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LinkedIn Post</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div
      class="flex justify-center items-center h-screen bg-[#052431] shadow-md overflow-hidden p-6 box-border"
    >
      <div class="flex flex-col">
        <div class="flex justify-center items-center mb-16">
          <img
            class="h-36 w-36 object-cover rounded-full border-2 border-white"
            src="https://media.licdn.com/dms/image/v2/D4E03AQE3WpirQLWcwA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1728316490982?e=1740009600&v=beta&t=FGFjKsheaOaiXoLOGA2-eVQ5gSA9O9aqiQSewM87CEY"
            alt="Profile Picture"
          />
          <div class="ml-5">
            <div class="text-white font-bold text-5xl mt-3">Muqeet Mughal</div>
            <div class="text-gray-400 text-2xl mb-4">
              Tailored ERP & Software Solutions
            </div>
          </div>
        </div>
        <div class="flex-grow flex flex-col justify-center text-center">
          <div
            class="text-white px-5 break-words text-5xl leading-relaxed mx-auto"
          >
            ${query.quote}
          </div>
        </div>
      </div>
      <div class="w-full border-4 bottom-40 absolute "></div>
      </div>
  </body>
</html>
  `;

  const outputPath = "output.png";

  try {
    await convertHtmlToPng(content, outputPath);
    res.setHeader("Content-Type", "image/png");
    res.sendFile(outputPath, { root: "." }, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      } else {
        fs.unlinkSync(outputPath); // Remove the file after sending it
      }
    });
  } catch (error) {
    console.error("Error generating PNG:", error);
    res.status(500).send("An error occurred while generating the PNG.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
