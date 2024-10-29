let currentStep = 1;
let API_KEY = ''; // API anahtarını burada tanımlıyoruz

function nextStep(step) {
    const currentBox = document.getElementById(`info-step-${currentStep}`);
    currentBox.classList.remove('active');
    currentStep++;
    const nextBox = document.getElementById(`info-step-${currentStep}`);
    if (nextBox) {
        nextBox.classList.add('active');
    }
}

function startUsingSite() {
    document.getElementById('info-container').style.display = 'none'; // Bilgi kutucuklarını gizle
    document.getElementById('blur-background').style.display = 'none'; // Bulanıklığı gizle
    // Siteyi aktif kullanmaya başla (varsa ilgili kod buraya eklenebilir)
}

function showAlert(message) {
    const alertDiv = document.getElementById('alert');
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
}

function clearAlert() {
    const alertDiv = document.getElementById('alert');
    alertDiv.style.display = 'none';
}

function showProgressBar() {
    const progressBar = document.getElementById('progress');
    progressBar.style.display = 'block';
    progressBar.style.width = '0%';
}

function hideProgressBar() {
    const progressBar = document.getElementById('progress');
    progressBar.style.display = 'none';
}

async function fetchApiKey() {
    const response = await fetch('/api-key');
    const data = await response.json();
    API_KEY = data.apiKey; // API anahtarını değişkene atıyoruz
}

// Sayfa yüklendiğinde API anahtarını al
window.onload = async () => {
    await fetchApiKey();
};

async function analyzeSite() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'none'; // Hide old results
    clearAlert();
    hideProgressBar(); // Hide old progress bar

    // URL validation
    if (!url) {
        showAlert('Please enter a URL.');
        return;
    }
    if (!/^https?:\/\//.test(url)) {
        showAlert('URL must start with https:// or http://.');
        return;
    }

    // Device selection
    const deviceType = document.querySelector('input[name="device"]:checked').value;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=${deviceType}`;

    console.log(`API URL: ${apiUrl}`); // Debugging line to log the API URL

    try {
        showProgressBar(); // Start the progress bar

        // Simulate loading bar
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width += 10; // Increase width by 10% every second
                document.getElementById('progress').style.width = width + '%';
            }
        }, 1000); // Updates every 1 second

        const response = await fetch(apiUrl);
        const text = await response.text(); // Yanıtı metin olarak al
        console.log(text); // Yanıt metnini konsola yazdır

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} - ${text}`);
        }

        const data = JSON.parse(text); // JSON parse et

        clearInterval(interval); // Stop loading bar
        hideProgressBar(); // Hide when done

        if (data.error) {
            throw new Error(data.error.message);
        }

        const performanceScore = data.lighthouseResult.categories.performance.score * 100;

        // Check for displayValue presence
        const fcp = data.lighthouseResult.audits['first-contentful-paint']?.displayValue || 'No data';
        const lcp = data.lighthouseResult.audits['largest-contentful-paint']?.displayValue || 'No data';
        const cls = data.lighthouseResult.audits['cumulative-layout-shift']?.displayValue || 'No data';
        const tbt = data.lighthouseResult.audits['total-blocking-time']?.displayValue || 'No data';
        const tti = data.lighthouseResult.audits['interactive']?.displayValue || 'No data';

        // Create opportunities section
        const opportunities = data.lighthouseResult.audits['diagnostics']?.details.items.map(item => item.description).join(', ') || 'No data';

        // Update results
        document.getElementById('performance-score').innerHTML = `Performance Score: ${performanceScore}`;
        document.getElementById('fcp').innerHTML = `First Contentful Paint: ${fcp}`;
        document.getElementById('lcp').innerHTML = `Largest Contentful Paint: ${lcp}`;
        document.getElementById('cls').innerHTML = `Cumulative Layout Shift: ${cls}`;
        document.getElementById('tbt').innerHTML = `Total Blocking Time: ${tbt}`;
        document.getElementById('tti').innerHTML = `Time to Interactive: ${tti}`;
        document.getElementById('opportunities').innerHTML = `Opportunities: ${opportunities}`;

        // Show results section
        resultDiv.style.display = 'block';

    } catch (error) {
        showAlert(`Error: ${error.message}`);
    }
}
