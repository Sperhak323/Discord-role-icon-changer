​⚡ Discord Custom Role Icons (Tampermonkey Script)
​This script allows you to replace default Discord role icons with custom images based on User ID, visible only to you in the browser.
​Key Features
​Reliable ID Detection: Smart fix handles finding the correct User ID even in message replies (nested avatars).
​Bypasses Restrictions: Uses Base64/Blob caching to overcome Discord's Content Security Policy (CSP).
​Fixes Display Issues: Removes the problematic srcset attribute to prevent flickering and ensures consistent 22x22px sizing.
​Installation
​Install Tampermonkey (or Greasemonkey) for your browser.
​Get the script file and click Raw to install it via the Tampermonkey dashboard.
​Configuration
​To set up your icons, edit the roleIconMap inside the script:

    const roleIconMap = {
        'YOUR_TARGET_USER_ID': 'LINK_TO_YOUR_CUSTOM_ICON.png',
        // ... add more entries
    };
    
Tip: Enable Discord Developer Mode (Settings > Advanced) to easily copy User IDs.

⚠️ Note
This is a user-side modification. Use at your own risk.
