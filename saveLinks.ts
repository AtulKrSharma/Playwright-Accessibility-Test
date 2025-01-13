import { chromium } from 'playwright';
import * as XLSX from 'xlsx';


async function handleAuthAndSaveLinks(url: string, username: string, password: string) {
    // Launch the browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        // Set HTTP authentication credentials
        httpCredentials: {
            username: username,
            password: password
        }
    });

    const page = await context.newPage();

    // Navigate to the URL (the HTTP authentication pop-up will be handled automatically)
    await page.goto(url);

    // Extract all hyperlinks after login
    const links = await page.$$eval('a', (anchors) => anchors.map(anchor => anchor.href));
    console.log('Captured Links:', links);

    // Save the links to an Excel file
    saveLinksToExcel(links);

    // Close the browser
    await browser.close();
}

function saveLinksToExcel(links: string[]) {
    // Create a new workbook and add a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Links'], ...links.map(link => [link])]); // Convert array of links to 2D array

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Links');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'New-Extracted_links.xlsx');
    console.log('Links have been saved to extracted_links.xlsx');
}

// Replace with the URL of the targeted website and your credentials
const websiteUrl = 'https://prod-gms.zu.com/'; // Replace with the actual URL
const username = 'gms-prod';         // Replace with your username
const password = 'GroupMedicalServices Rebuild';         // Replace with your password

handleAuthAndSaveLinks(websiteUrl, username, password).catch(err => console.error('Error:', err));
