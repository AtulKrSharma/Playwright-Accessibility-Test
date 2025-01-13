import { chromium } from "playwright";

async function handleAuthPopup(
  url: string,
  //username: string,
  //password: string
) {
  // Launch the browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    // Set HTTP authentication credentials
    // httpCredentials: {
    //   username: username,
    //   password: password,
    // },
  });

  const page = await context.newPage();

  // Navigate to the URL (the HTTP authentication pop-up will be handled automatically)
  await page.goto(url);

  // Perform further actions after login, if needed
  console.log("Logged in successfully!");

  // Extract all hyperlinks after login
  const links = await page.$$eval("a", (anchors) =>
    anchors.map((anchor) => anchor.href)
  );
  console.log("Captured Links:", links);

  // Loop through each link and click it
  for (const link of links) {
    try {
      console.log(`Navigating to: ${link}`);
      await page.goto(link); // Navigate to the hyperlink
      await page.waitForTimeout(2000); // Optional: wait for 2 seconds for the page to load

      // Example: Get the page title after navigating to each link
      const pageTitle = await page.title();
      console.log(`Page Title for ${link}: ${pageTitle}`);

      // You can add more actions here, like capturing screenshots, scraping data, etc.
    } catch (error) {
      console.error(`Failed to navigate to ${link}:`, error);
    }
  }

  // Close the browser after processing all links
  await browser.close();
}

// Replace with the URL of the targeted website and your credentials
const websiteUrl = "https://gms.ca/"; // Replace with the actual URL
// const username = "gms-prod"; // Replace with your username
// const password = "GroupMedicalServices Rebuild"; // Replace with your password

// handleAuthPopup(websiteUrl, username, password).catch((err) =>
//   console.error("Error:", err)
// );
handleAuthPopup(websiteUrl).catch((err) =>
  console.error("Error:", err)
);
