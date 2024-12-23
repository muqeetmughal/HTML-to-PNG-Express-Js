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
  await page.setViewport({ width: 1500, height: 1500 }); // Adjust as needed
  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();
}

// Route to handle HTML to PNG conversion
app.get("/generate-png", async (req, res) => {
  const { query } = req;

  if (!query.quote) {
    res.status(400).send("Query for quote is missing.");
  }

  const htmlFilePath = "./template.html";
  let content;

  try {
    content = fs.readFileSync(htmlFilePath, "utf8");
  } catch (error) {
    console.error("Error reading HTML file:", error);
    res.status(500).send("An error occurred while reading the HTML file.");
    return;
  }

  content = content.replace("${query.quote}", query.quote);

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
