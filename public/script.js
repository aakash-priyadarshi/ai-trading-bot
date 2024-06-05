const socket = io();

const ctx = document.getElementById('tradingChart').getContext('2d');
const tradingChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Time labels
        datasets: [{
            label: 'Stock Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                }
            }
        }
    }
});

socket.on('marketData', (data) => {
    tradingChart.data.labels = data.labels;
    tradingChart.data.datasets[0].data = data.prices;
    tradingChart.update();
});

function executeTrade(action) {
    socket.emit('executeTrade', { action });
}
