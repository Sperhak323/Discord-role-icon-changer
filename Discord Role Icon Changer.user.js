// ==UserScript==
// @name         Discord Role Icon Changer
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Mení role ikon (Oprava pre odpovede/replies)
// @match        https://discord.com/*
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const roleIconMap = {
        'YOUR_DC_ID': 'https://YOUR_ICON.png',
        'OTHER_DC_ID': 'https://OTHER_ICON.webp'
    };

    const imageCache = {};

    function fetchAndSetImage(url, imgElement) {
        if (imageCache[url]) {
            imgElement.src = imageCache[url];
            applyStyles(imgElement);
            return;
        }

        if (imgElement.dataset.loading === "true") return;
        imgElement.dataset.loading = "true";

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            responseType: "blob",
            onload: function(response) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result;
                    imageCache[url] = base64data;
                    imgElement.src = base64data;
                    imgElement.dataset.loading = "false";
                    applyStyles(imgElement);
                    document.querySelectorAll(`img[data-pending-url="${url}"]`).forEach(el => {
                        el.src = base64data;
                        applyStyles(el);
                    });
                };
                reader.readAsDataURL(response.response);
            },
            onerror: function(err) {
                // console.error("Chyba sťahovania:", err);
                imgElement.dataset.loading = "false";
            }
        });
    }

    function applyStyles(img) {
        img.removeAttribute('srcset');
        img.style.width = "22px";
        img.style.height = "22px";
        img.style.objectFit = "contain";
        img.style.verticalAlign = "text-bottom";
        img.dataset.roleChanged = "true";
    }

    // Pomocná funkcia na vytiahnutie čísla z URL avatara
    function extractIdFromUrl(url) {
        if (!url) return null;
        const m = url.match(/avatars\/(\d+)\//);
        return m ? m[1] : null;
    }

    // --- TOTO JE TA OPRAVENÁ ČASŤ ---
    function getUserIdFromElement(el) {
        // 1. Skontrolujeme, či je ikonka v časti "Odpoveď" (tá malá správa hore)
        // Discord používa triedy ako 'repliedMessage_...'
        const replyContext = el.closest('[class*="repliedMessage"]');
        if (replyContext) {
            // Ak sme v odpovedi, hľadáme len avatar vo vnútri tejto odpovede
            const avatar = replyContext.querySelector('img[src*="avatars/"]');
            if (avatar) return extractIdFromUrl(avatar.src);
        }

        // 2. Skontrolujeme, či je ikonka v hlavnej časti správy
        // Discord používa 'contents_...' pre telo správy
        const messageContext = el.closest('[class*="contents"]');
        if (messageContext) {
            // Hľadáme hlavný avatar. POZOR: Musíme ignorovať malé avatary z odpovedí,
            // ak by sa tam náhodou nejaké zatúlali, ale 'contents' by mal byť bezpečný.
            // Hľadáme img s triedou 'avatar'
            const avatar = messageContext.querySelector('img[class*="avatar"]');
            if (avatar) return extractIdFromUrl(avatar.src);
        }

        // 3. Fallback pre Member List (pravý panel)
        const memberItem = el.closest('[class*="memberInner"], [class*="layout"]');
        if (memberItem) {
            const avatar = memberItem.querySelector('img[src*="avatars/"]');
            if (avatar) return extractIdFromUrl(avatar.src);
        }
        // 4. Posledná záchrana (User Popout / Profil)
        const profileContext = el.closest('[class*="userPopout"], [class*="userProfile"]');
        if (profileContext) {
             const avatar = profileContext.querySelector('img[src*="avatars/"]');
             if (avatar) return extractIdFromUrl(avatar.src);
        }

        return null;
    }

    function updateRoleIcons() {
        const icons = document.querySelectorAll('img[src*="/role-icons/"], img[class*="roleIcon"]');

        icons.forEach(icon => {
            if (icon.dataset.roleChanged === "true" && icon.src.startsWith("data:")) return;

            const userId = getUserIdFromElement(icon);
            // Debuggovanie: Ak to stále nejde, odkomentuj toto a stlač F12
            // console.log("Ikonka:", icon, "Nájdené ID:", userId);

            if (!userId) return;

            if (roleIconMap[userId]) {
                const targetUrl = roleIconMap[userId];
                icon.dataset.pendingUrl = targetUrl;
                fetchAndSetImage(targetUrl, icon);
            }
        });
    }

    const observer = new MutationObserver(() => updateRoleIcons());
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(updateRoleIcons, 1000);
})();
