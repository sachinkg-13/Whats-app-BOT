const puppeteer = require("puppeteer");

const downloadInstagramVideo = async (instagramUrl) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto(process.env.DOWNLOADER_LINK, { waitUntil: "networkidle2" });

    await page.waitForSelector("input[name='q']", { timeout: 15000 });
    await page.type("input[name='q']", instagramUrl);

    // await page.click("button[type='submit']");
    await page.waitForSelector("button.btn.btn-default", { timeout: 10000 });
    await page.click("button.btn.btn-default");

    await page.waitForSelector(".modal-content", { timeout: 15000 });
    await page.waitForSelector(".modal-content button", { timeout: 15000 });

    await page.evaluate(() => {
      const closeButton = [...document.querySelectorAll("button")].find(
        (btn) => btn.textContent.trim().toLowerCase() === "close"
      );
      if (closeButton) closeButton.click();
    });

    await page.waitForSelector(".download-items__btn a", { timeout: 20000 });

    const videoUrl = await page.$eval(
      ".download-items__btn a",
      (el) => el.href
    );

    await browser.close();
    return videoUrl;
  } catch (error) {
    console.error("❌ Error downloading Instagram video:", error.message);
    return null;
  }
};

module.exports = downloadInstagramVideo;
