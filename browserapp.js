const homePage = "https://duckduckgo.com"; // Set your home page URL here

function openBrowserWindow(url = homePage) {
    const browserWindow = document.getElementById('browserWindow');
    const browserUrl = document.getElementById('browserUrl');
    
    browserUrl.value = url;
    loadUrlInIframe(url);
    browserWindow.style.display = 'block';
    browserWindow.style.zIndex = getNextZIndex();
    bringWindowToFront('browserWindow');
}

function handleUrlKeyPress(event) {
    if (event.key === 'Enter') {
        const url = event.target.value;
        navigateToUrl(url);
    }
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        const query = event.target.value;
        searchWithDuckDuckGo(query);
    }
}

function navigateToUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    document.getElementById('browserUrl').value = url;
    loadUrlInIframe(url);
}

function searchWithDuckDuckGo(query) {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    loadUrlInIframe(searchUrl);
}

function loadUrlInIframe(url) {
    const proxyIp = '47.252.29.28';
    const proxyPort = '11222';
    const proxyUrl = `http://${proxyIp}:${proxyPort}/${url.replace(/^https?:\/\//, '')}`;
    const browserFrame = document.getElementById('browserFrame');
    browserFrame.src = proxyUrl;
    document.getElementById('errorLink').href = url;
    browserFrame.style.display = 'block';
    browserFrame.nextElementSibling.style.display = 'none';
}

function goHome() {
    navigateToUrl(homePage);
}

function isSameOrigin(url) {
    const pageLocation = window.location;
    const URL_HOST_PATTERN = /(\w+):\/\/([^/:]+)(:\d*)?/;
    const urlMatch = URL_HOST_PATTERN.exec(url) || [];
    return urlMatch[2] === pageLocation.hostname;
}

function getNextZIndex() {
    const elements = document.querySelectorAll('.window');
    let highestZIndex = 0;
    elements.forEach(function(element) {
        const zIndex = window.getComputedStyle(element).getPropertyValue('z-index');
        if (zIndex > highestZIndex) {
            highestZIndex = zIndex;
        }
    });
    return highestZIndex + 1;
}

function bringWindowToFront(id) {
    const windowElement = document.getElementById(id);
    windowElement.style.zIndex = getNextZIndex();
}
