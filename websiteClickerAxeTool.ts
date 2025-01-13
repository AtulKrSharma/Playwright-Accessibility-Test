import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import * as XLSX from 'xlsx'; // Import xlsx package to handle Excel files
import * as fs from 'fs';

async function handleAuthPopup(
  url: string,
  username: string,
  password: string
) {
  // Launch the browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // Set HTTP authentication credentials
    httpCredentials: {
      username: username,
      password: password,
    },
   // viewport: { width: 1920, height: 1080 }, // Set viewport size
  });

  const page = await context.newPage();

  // Navigate to the URL (the HTTP authentication pop-up will be handled automatically)
  await page.goto(url, { waitUntil: "load" }); // Ensure the page is fully loaded
  console.log("Logged in successfully!");

  // Extract all hyperlinks after login
  const links = await page.$$eval("a", (anchors) =>
    anchors.map((anchor) => anchor.href)
  );
  console.log("Captured Links:", links);

  // Array to store accessibility results for all pages
  const accessibilityResults: any[] = [];

  // Loop through each link and click it
  for (const link of links) {
    try {
      console.log(`Navigating to: ${link}`);

      // Open the link in a new page to avoid disrupting the current page
      const newPage = await context.newPage();
      await newPage.goto(link, { waitUntil: "load" }); // Wait for the page to fully load

      // Optional: Wait for 2 seconds for the page content to stabilize
      await newPage.waitForTimeout(2000);

      // Get the page title after navigating to each link
      const pageTitle = await newPage.title();
      console.log(`Page Title for ${link}: ${pageTitle}`);

      // Perform accessibility check using @axe-core/playwright
      const axeResults = await new AxeBuilder({ page: newPage }).analyze(); // Correctly instantiate AxeBuilder with page object
      console.log(`Accessibility issues for ${link}:`, axeResults.violations.length);

      // Store accessibility results with link, page title, violations, and standards
      accessibilityResults.push({
        url: link,
        title: pageTitle,
        violations: axeResults.violations.map((violation) => ({
          tags: violation.tags.join(", "), // Tags for accessibility standards violated (e.g., WCAG2AA)
          id: violation.id,
          description: violation.description,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => node.html),
          
        })),
      });

      // Close the page after processing
      await newPage.close();
    } catch (error) {
      console.error(`Failed to navigate to ${link}:`, error);
    }
  }

  // Save the accessibility results to an Excel sheet
  saveResultsToExcel(accessibilityResults);

  // Close the browser after processing all links
  await browser.close();
}

// Function to save accessibility results to Excel
function saveResultsToExcel(results: any[]) {
  const workbook = XLSX.utils.book_new(); // Create a new workbook
  const sheetData: any[] = [];

  // Add headers for the Excel sheet
  sheetData.push([
    "URL",
    "Page Title",
    "Failed Standards (Tags)", // New column for accessibility standards
    "Violation ID",
    "Violation Description",
    "Impact Level",
    "Affected Nodes (HTML)"
 
  ]);

  // Add results for each page
  results.forEach((result) => {
    result.violations.forEach((violation: any) => {
      sheetData.push([
        result.url,
        result.title,
        violation.tags, // Accessibility standards violated
        violation.id,
        violation.description,
        violation.impact,
        violation.nodes.join(", ") // Affected nodes as a comma-separated string        
      ]);
    });
  });

  // Create a worksheet from the data
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Accessibility Report");

  // Write the workbook to a file
  const filePath = "accessibility_report.xlsx";
  XLSX.writeFile(workbook, filePath);

  console.log(`Accessibility results saved to ${filePath}`);
}

// Replace with the URL of the targeted website and your credentials
const websiteUrl = "https://prod-gms.zu.com/"; // Replace with the actual URL
const username = "gms-prod"; // Replace with your username
const password = "GroupMedicalServices Rebuild"; // Replace with your password

handleAuthPopup(websiteUrl, username, password).catch((err) =>
  console.error("Error:", err)
);
