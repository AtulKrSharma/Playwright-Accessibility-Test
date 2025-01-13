import { chromium } from 'playwright';

async function handleAuthPopup(url: string, username: string, password: string) {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });
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

    // Perform further actions after login, if needed
    console.log('Logged in successfully!');

    // Example: Extract all hyperlinks after login
    const links = await page.$$eval('a', (anchors) => anchors.map(anchor => anchor.href));
    console.log('Captured Links:', links);

    // Close the browser
    await browser.close();
}

// Replace with the URL of the targeted website and your credentials
const websiteUrl = 'https://prod-gms.zu.com/'; // Replace with the actual URL
const username = 'gms-prod';         // Replace with your username
const password = 'GroupMedicalServices Rebuild';         // Replace with your password

handleAuthPopup(websiteUrl, username, password).catch(err => console.error('Error:', err));
