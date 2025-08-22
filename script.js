// --- Chart Variable Initialization ---
let myChart = null;

// --- Dark Mode Logic ---
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const toggleBall = document.getElementById('toggleBall');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function setTheme(isDark) {
    htmlElement.classList.toggle('dark', isDark);
    if (isDark) {
        toggleBall.style.transform = 'translateX(24px)';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        toggleBall.style.transform = 'translateX(0)';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    // Update chart colors if it exists
    const newColor = isDark ? '#f9fafb' : '#1f2937';
    Chart.defaults.color = newColor;
    if (myChart) {
        myChart.options.plugins.legend.labels.color = newColor;
        myChart.options.plugins.title.color = newColor;
        if (myChart.options.scales) {
             myChart.options.scales.x.ticks.color = newColor;
             myChart.options.scales.y.ticks.color = newColor;
             myChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
             myChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        }
        myChart.update();
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialThemeIsDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
setTheme(initialThemeIsDark);
darkModeToggle.checked = initialThemeIsDark;

darkModeToggle.addEventListener('change', () => {
    setTheme(darkModeToggle.checked);
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});

// --- Chart Maker Logic ---
const chartForm = document.getElementById('chartForm');
const chartNameInput = document.getElementById('chartName');
const dataInputsContainer = document.getElementById('data-inputs');
const addRowBtn = document.getElementById('add-row-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const downloadSection = document.getElementById('download-section');
const downloadBtn = document.getElementById('download-btn');
const clearChartBtn = document.getElementById('clear-chart-btn');
const chartCanvas = document.getElementById('myChart');

// Modern color palette
const MODERN_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#f97316', '#06b6d4'];

// Set Chart.js defaults
Chart.defaults.font.family = "'Inter', sans-serif";
// Register the datalabels plugin globally
Chart.register(ChartDataLabels);


// Function to add a new data input row
addRowBtn.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'data-row grid grid-cols-12 gap-2';
    newRow.innerHTML = `
        <input type="text" class="input-field col-span-7 rounded-lg px-3 py-2" placeholder="Label">
        <input type="number" class="input-field col-span-4 rounded-lg px-3 py-2" placeholder="Value">
        <button type="button" class="remove-row-btn col-span-1 text-red-500 text-2xl font-bold">&times;</button>
    `;
    dataInputsContainer.appendChild(newRow);
});

// Function to clear all data rows
clearAllBtn.addEventListener('click', () => {
    const dataRows = dataInputsContainer.querySelectorAll('.data-row');
    // Keep the first row, clear the rest
    for (let i = dataRows.length - 1; i > 0; i--) {
        dataRows[i].remove();
    }
    // Clear the values of the first row
    dataRows[0].children[0].value = '';
    dataRows[0].children[1].value = '';
});

// Function to remove a data input row
dataInputsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-row-btn')) {
        e.target.parentElement.remove();
    }
});

// Function to generate the chart
chartForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dataRows = dataInputsContainer.querySelectorAll('.data-row');
    const labels = [];
    const data = [];
    const chartTitle = chartNameInput.value || 'Your Custom Chart'; // Get the chart title

    dataRows.forEach(row => {
        const label = row.children[0].value;
        const value = row.children[1].value;
        if (label && value) {
            labels.push(label);
            data.push(parseInt(value));
        }
    });

    if (labels.length === 0) {
        alert('Please add some data to generate a chart.');
        return;
    }

    const chartType = document.querySelector('input[name="chartType"]:checked').value;

    // Destroy previous chart instance if it exists
    if (myChart) {
        myChart.destroy();
    }
    
    const isDark = htmlElement.classList.contains('dark');
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Use the modern color palette
    const backgroundColors = data.map((_, i) => MODERN_COLORS[i % MODERN_COLORS.length]);

    myChart = new Chart(chartCanvas, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'My Data',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#fff', // White border for better separation
                borderWidth: chartType === 'pie' ? 2 : 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: chartType === 'pie', // Show legend ONLY for pie charts
                    position: 'bottom',
                    labels: {
                        color: textColor
                    }
                },
                title: {
                    display: true,
                    text: chartTitle, // Use the dynamic title
                    color: textColor,
                    font: { size: 18 }
                },
                // Datalabels plugin configuration
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    },
                    formatter: (value) => {
                        return value;
                    }
                }
            },
            scales: chartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            } : {}
        }
    });
    
    downloadSection.classList.remove('hidden');
});

// Function to download the chart with the correct background color
downloadBtn.addEventListener('click', () => {
    if (myChart) {
        // Get the current background color from the CSS variable
        const bgColor = getComputedStyle(document.body).getPropertyValue('--bg-body').trim();

        // Create a temporary canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set dimensions
        tempCanvas.width = chartCanvas.width;
        tempCanvas.height = chartCanvas.height;

        // Fill the background
        tempCtx.fillStyle = bgColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the chart on top
        tempCtx.drawImage(chartCanvas, 0, 0);

        // Trigger download
        const link = document.createElement('a');
        link.href = tempCanvas.toDataURL('image/png');
        link.download = `${chartNameInput.value || 'my-chart'}.png`;
        link.click();
    }
});

// Function to clear the chart
clearChartBtn.addEventListener('click', () => {
    if (myChart) {
        myChart.destroy();
        myChart = null;
        downloadSection.classList.add('hidden');
    }
});
