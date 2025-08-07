const http = require('http');
const url = require('url');
const VoiceSyncEngine = require('./automation.js');

let isAuthenticated = false;
let automationEngine = null;

try {
    automationEngine = new VoiceSyncEngine();
    console.log('VoiceSync automation engine initialized');
} catch (error) {
    console.error('Engine initialization failed:', error.message);
}

const server = http.createServer(async (req, res) => {
    const pathname = url.parse(req.url).pathname;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');
            
            if (username === 'KryptowKing' && password === 'crypto2024') {
                isAuthenticated = true;
                console.log('KryptowKing authenticated successfully');
                res.writeHead(302, {'Location': '/'});
                res.end();
            } else {
                console.log('Invalid login attempt');
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(getLoginPage('Invalid credentials'));
            }
        });
        return;
    }

    if (pathname === '/api/start') {
        if (automationEngine) {
            try {
                const result = await automationEngine.start();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: error.message}));
            }
        } else {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Engine not available'}));
        }
        return;
    }

    if (pathname === '/api/stop') {
        if (automationEngine) {
            try {
                const result = await automationEngine.stop();
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: error.message}));
            }
        } else {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Engine not available'}));
        }
        return;
    }

    if (pathname === '/api/stats') {
        const stats = automationEngine ? automationEngine.getStats() : {
            surveysCompleted: 0,
            totalEarnings: 0,
            isRunning: false,
            dailyProgress: 0
        };
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(stats));
        return;
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(isAuthenticated ? getDashboard() : getLoginPage());
});

function getLoginPage(error = '') {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoiceSync AI - KryptowKing Access</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
        }
        h1 { color: #333; margin-bottom: 20px; }
        input {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }
        .error {
            color: #dc3545;
            margin: 10px 0;
            padding: 8px;
            background: #f8d7da;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">VS</div>
        <h1>VoiceSync AI</h1>
        <p>Survey Automation System</p>
        ${error ? `<div class="error">${error}</div>` : ''}
        <form method="POST" action="/login">
            <input type="text" name="username" value="KryptowKing" required>
            <input type="password" name="password" value="crypto2024" required>
            <button type="submit">Access Dashboard</button>
        </form>
    </div>
</body>
</html>`;
}

function getDashboard() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoiceSync AI - Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 { margin: 0; font-size: 2rem; }
        .main { padding: 20px; max-width: 1000px; margin: 0 auto; }
        .status {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            border: 2px solid #ffa500;
            color: #d2691e;
            font-weight: bold;
        }
        .status.running {
            border-color: #28a745;
            color: #155724;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        .controls {
            background: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin: 5px;
            min-width: 150px;
        }
        .btn-start {
            background: #28a745;
            color: white;
        }
        .btn-stop {
            background: #dc3545;
            color: white;
        }
        .btn-connect {
            background: #007bff;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>VoiceSync AI</h1>
        <p>KryptowKing Survey Automation</p>
    </div>
    
    <div class="main">
        <div id="status" class="status">
            System Ready - Working Puppeteer Engine Deployed
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" id="surveys">0</div>
                <div class="stat-label">Surveys Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="earnings">$0.00</div>
                <div class="stat-label">Total Earnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="progress">0%</div>
                <div class="stat-label">Daily Progress</div>
            </div>
        </div>
        
        <div class="controls">
            <h3>Automation Controls</h3>
            <button class="btn btn-start" onclick="startAutomation()">Start Automation</button>
            <button class="btn btn-stop" onclick="stopAutomation()">Stop Automation</button>
            <button class="btn btn-connect" onclick="openSwagbucks()">Open Swagbucks</button>
        </div>
    </div>
    
    <script>
        function startAutomation() {
            fetch('/api/start')
                .then(r => r.json())
                .then(data => {
                    console.log('Started:', data);
                    updateStatus();
                })
                .catch(err => console.error('Start error:', err));
        }
        
        function stopAutomation() {
            fetch('/api/stop')
                .then(r => r.json())
                .then(data => {
                    console.log('Stopped:', data);
                    updateStatus();
                })
                .catch(err => console.error('Stop error:', err));
        }
        
        function openSwagbucks() {
            window.open('https://www.swagbucks.com', '_blank');
        }
        
        function updateStatus() {
            fetch('/api/stats')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('surveys').textContent = data.surveysCompleted || 0;
                    document.getElementById('earnings').textContent = '$' + (data.totalEarnings || 0).toFixed(2);
                    document.getElementById('progress').textContent = (data.dailyProgress || 0) + '%';
                    
                    const status = document.getElementById('status');
                    if (data.isRunning) {
                        status.className = 'status running';
                        status.innerHTML = 'AUTOMATION RUNNING - KryptowKing earning money';
                    } else {
                        status.className = 'status';
                        status.innerHTML = 'System Ready - Working Puppeteer Engine Deployed';
                    }
                })
                .catch(err => console.error('Stats error:', err));
        }
        
        setInterval(updateStatus, 3000);
        updateStatus();
    </script>
</body>
</html>`;
}

server.listen(80, '0.0.0.0', () => {
    console.log('VoiceSync Server running on port 80');
    console.log('Access: http://67.205.157.193');
    console.log('Login: KryptowKing / crypto2024');
});

process.on('SIGTERM', async () => {
    if (automationEngine && automationEngine.isRunning) {
        await automationEngine.stop();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    if (automationEngine && automationEngine.isRunning) {
        await automationEngine.stop();
    }
    process.exit(0);
});
