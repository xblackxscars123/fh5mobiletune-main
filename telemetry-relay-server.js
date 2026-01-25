#!/usr/bin/env node

/**
 * Forza Horizon 5 Telemetry Relay Server
 * Relays UDP telemetry data from Forza Horizon 5 to WebSocket clients
 * Compatible with PRO TUNER Forza Tuning Calculator
 *
 * Usage: node telemetry-relay-server.js
 * Connect in browser: ws://localhost:8765 (or ws://YOUR_IP:8765 for remote)
 */

const dgram = require('dgram');
const WebSocket = require('ws');
const http = require('http');

// Configuration
const UDP_PORT = process.env.UDP_PORT || 5555;      // Forza Data Out port
const WS_PORT = process.env.WS_PORT || 8765;        // WebSocket port
const HTTP_PORT = process.env.HTTP_PORT || 8080;    // HTTP server for testing
const HOST = process.env.HOST || '0.0.0.0';        // Listen on all interfaces

// Forza Horizon 5 Telemetry Packet Structure (FH4/FH5)
// Packet size: 324 bytes (FH4) or 331 bytes (FH5)
const PACKET_SIZE = 331; // FH5 packet size
const PACKET_FORMAT = {
  // Timing
  isRaceOn: 0,              // 0 = off, 1 = on
  timestampMS: 4,           // Timestamp in milliseconds

  // Engine
  engineMaxRpm: 8,          // Engine max RPM
  engineIdleRpm: 12,        // Engine idle RPM
  currentEngineRpm: 16,     // Current engine RPM

  // Acceleration
  accelerationX: 20,        // Acceleration in G (right positive)
  accelerationY: 24,        // Acceleration in G (forward positive)
  accelerationZ: 28,        // Acceleration in G (up positive)

  // Velocity
  velocityX: 32,            // Velocity in m/s (right positive)
  velocityY: 36,            // Velocity in m/s (forward positive)
  velocityZ: 40,            // Velocity in m/s (up positive)

  // Angular Velocity
  angularVelocityX: 44,     // Angular velocity in rad/s
  angularVelocityY: 48,     // Angular velocity in rad/s
  angularVelocityZ: 52,     // Angular velocity in rad/s

  // Yaw, Pitch, Roll
  yaw: 56,                  // Yaw angle in radians
  pitch: 60,                // Pitch angle in radians
  roll: 64,                 // Roll angle in radians

  // Normalized Vectors
  normalizedSuspensionTravelFrontLeft: 68,    // 0.0 - 1.0
  normalizedSuspensionTravelFrontRight: 72,   // 0.0 - 1.0
  normalizedSuspensionTravelRearLeft: 76,     // 0.0 - 1.0
  normalizedSuspensionTravelRearRight: 80,    // 0.0 - 1.0

  // Tire normalized slip angle
  tireSlipAngleFrontLeft: 84,   // Tire slip angle in radians
  tireSlipAngleFrontRight: 88,  // Tire slip angle in radians
  tireSlipAngleRearLeft: 92,    // Tire slip angle in radians
  tireSlipAngleRearRight: 96,   // Tire slip angle in radians

  // Tire normalized combined slip
  tireCombinedSlipFrontLeft: 100,   // Tire combined slip
  tireCombinedSlipFrontRight: 104,  // Tire combined slip
  tireCombinedSlipRearLeft: 108,    // Tire combined slip
  tireCombinedSlipRearRight: 112,   // Tire combined slip

  // Wheel rotation speeds
  wheelRotationSpeedFrontLeft: 116,   // rad/s
  wheelRotationSpeedFrontRight: 120,  // rad/s
  wheelRotationSpeedRearLeft: 124,    // rad/s
  wheelRotationSpeedRearRight: 128,   // rad/s

  // Last face contact times
  lastLapTime: 132,         // Last lap time in seconds
  currentLapTime: 136,      // Current lap time in seconds
  bestLapTime: 140,         // Best lap time in seconds
  lapNumber: 144,           // Current lap number

  // Race position and session
  racePosition: 148,        // Race position (1-based)
  numCars: 152,            // Number of cars in race
  sessionType: 156,        // 0 = Practice, 1 = Qualifying, 2 = Race

  // Tire temperatures (Celsius)
  tireTempFrontLeft: 160,
  tireTempFrontRight: 164,
  tireTempRearLeft: 168,
  tireTempRearRight: 172,

  // Brake temperatures (Celsius)
  brakeTempFrontLeft: 176,
  brakeTempFrontRight: 180,
  brakeTempRearLeft: 184,
  brakeTempRearRight: 188,

  // Clutch pedal position
  clutchPedal: 192,        // 0.0 - 1.0

  // Throttle and brake pedal positions
  throttlePedal: 196,      // 0.0 - 1.0
  brakePedal: 200,         // 0.0 - 1.0

  // Fuel level
  fuelLevel: 204,          // Fuel remaining (0.0 - 1.0)
  fuelCapacity: 208,       // Fuel capacity in liters

  // Speed in different units
  speed: 212,              // m/s
  speedKmh: 216,           // km/h
  speedMph: 220,           // mph

  // Turbo boost and manifold pressure
  turboBoost: 224,         // PSI
  oilTemp: 228,           // Celsius
  oilPressure: 232,       // Bar
  waterTemp: 236,         // Celsius

  // Fuel pressure and consumption
  fuelPressure: 240,      // Bar
  fuelConsumption: 244,   // Instant fuel consumption L/h
  fuelMixture: 248,       // Air-fuel mixture ratio

  // Current gear
  currentGear: 252,       // 0 = Neutral, 1-10 = gears

  // Suggested gear
  suggestedGear: 256,     // Suggested gear

  // Throttle position
  throttle: 260,          // 0.0 - 1.0
  brake: 264,             // 0.0 - 1.0

  // Clutch position
  clutch: 268,            // 0.0 - 1.0

  // Engine torque and power
  engineTorque: 272,      // Nm
  enginePower: 276,       // HP

  // Surface type
  surfaceRumbleFrontLeft: 280,   // Surface rumble
  surfaceRumbleFrontRight: 284,  // Surface rumble
  surfaceRumbleRearLeft: 288,    // Surface rumble
  surfaceRumbleRearRight: 292,   // Surface rumble

  // Tire wear (0.0 - 1.0, where 1.0 = brand new)
  tireWearFrontLeft: 296,
  tireWearFrontRight: 300,
  tireWearRearLeft: 304,
  tireWearRearRight: 308,

  // Brake pad compound
  brakePadCompoundFrontLeft: 312,
  brakePadCompoundFrontRight: 316,
  brakePadCompoundRearLeft: 320,
  brakePadCompoundRearRight: 324,

  // FH5 specific data (additional bytes)
  tireCompoundFrontLeft: 328,
  tireCompoundFrontRight: 329,
  tireCompoundRearLeft: 330,
  tireCompoundRearRight: 331
};

// Global state
let lastPacket = null;
let packetCount = 0;
let startTime = Date.now();

// Create UDP server to receive Forza telemetry
const udpServer = dgram.createSocket('udp4');

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`🔗 Forza Telemetry Relay Server Started`);
  console.log(`📡 Listening for Forza UDP data on ${address.address}:${address.port}`);
  console.log(`🌐 WebSocket server available at ws://${address.address}:${WS_PORT}`);
  console.log(`📄 HTTP test page at http://${address.address}:${HTTP_PORT}`);
  console.log(`\n📋 Setup Instructions:`);
  console.log(`1. In Forza Horizon 5: Settings → HUD & Gameplay → Data Out`);
  console.log(`2. Set Data Out: ON`);
  console.log(`3. IP Address: ${address.address}`);
  console.log(`4. Port: ${UDP_PORT}`);
  console.log(`5. Start driving!`);
});

udpServer.on('message', (msg, remote) => {
  if (msg.length >= PACKET_SIZE) {
    lastPacket = parseForzaPacket(msg);
    packetCount++;

    // Broadcast to all connected WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(lastPacket));
      }
    });

    // Log occasional status updates
    if (packetCount % 100 === 0) {
      const uptime = Math.round((Date.now() - startTime) / 1000);
      console.log(`📊 Received ${packetCount} packets (${uptime}s uptime)`);
    }
  }
});

udpServer.on('error', (err) => {
  console.error('❌ UDP Server error:', err);
});

udpServer.bind(UDP_PORT, HOST);

// Create WebSocket server for browser clients
const wss = new WebSocket.Server({ port: WS_PORT, host: HOST });

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🔌 WebSocket client connected from ${clientIP}`);

  // Send current data immediately if available
  if (lastPacket) {
    ws.send(JSON.stringify(lastPacket));
  }

  ws.on('close', () => {
    console.log(`🔌 WebSocket client disconnected (${clientIP})`);
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err);
  });
});

// Create HTTP server for testing and diagnostics
const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getTestPage());
  } else if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      uptime: Math.round((Date.now() - startTime) / 1000),
      packetsReceived: packetCount,
      clientsConnected: wss.clients.size,
      lastPacketTime: lastPacket ? new Date().toISOString() : null
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

httpServer.listen(HTTP_PORT, HOST, () => {
  console.log(`📄 HTTP server listening on http://${HOST}:${HTTP_PORT}`);
});

// Parse Forza telemetry packet
function parseForzaPacket(buffer) {
  const data = {};

  // Helper function to read float32 from buffer
  const readFloat32 = (offset) => buffer.readFloatLE(offset);

  // Helper function to read int32 from buffer
  const readInt32 = (offset) => buffer.readInt32LE(offset);

  // Parse all packet fields
  data.isRaceOn = readInt32(PACKET_FORMAT.isRaceOn);
  data.timestampMS = readInt32(PACKET_FORMAT.timestampMS);

  // Engine data
  data.engineMaxRpm = readFloat32(PACKET_FORMAT.engineMaxRpm);
  data.engineIdleRpm = readFloat32(PACKET_FORMAT.engineIdleRpm);
  data.currentEngineRpm = readFloat32(PACKET_FORMAT.currentEngineRpm);

  // Acceleration (G-forces)
  data.accelerationX = readFloat32(PACKET_FORMAT.accelerationX);
  data.accelerationY = readFloat32(PACKET_FORMAT.accelerationY);
  data.accelerationZ = readFloat32(PACKET_FORMAT.accelerationZ);

  // Velocity (m/s)
  data.velocityX = readFloat32(PACKET_FORMAT.velocityX);
  data.velocityY = readFloat32(PACKET_FORMAT.velocityY);
  data.velocityZ = readFloat32(PACKET_FORMAT.velocityZ);

  // Angular velocity (rad/s)
  data.angularVelocityX = readFloat32(PACKET_FORMAT.angularVelocityX);
  data.angularVelocityY = readFloat32(PACKET_FORMAT.angularVelocityY);
  data.angularVelocityZ = readFloat32(PACKET_FORMAT.angularVelocityZ);

  // Orientation (radians)
  data.yaw = readFloat32(PACKET_FORMAT.yaw);
  data.pitch = readFloat32(PACKET_FORMAT.pitch);
  data.roll = readFloat32(PACKET_FORMAT.roll);

  // Suspension travel (0.0 - 1.0)
  data.suspensionTravelFrontLeft = readFloat32(PACKET_FORMAT.normalizedSuspensionTravelFrontLeft);
  data.suspensionTravelFrontRight = readFloat32(PACKET_FORMAT.normalizedSuspensionTravelFrontRight);
  data.suspensionTravelRearLeft = readFloat32(PACKET_FORMAT.normalizedSuspensionTravelRearLeft);
  data.suspensionTravelRearRight = readFloat32(PACKET_FORMAT.normalizedSuspensionTravelRearRight);

  // Tire slip angles (radians)
  data.tireSlipAngleFrontLeft = readFloat32(PACKET_FORMAT.tireSlipAngleFrontLeft);
  data.tireSlipAngleFrontRight = readFloat32(PACKET_FORMAT.tireSlipAngleFrontRight);
  data.tireSlipAngleRearLeft = readFloat32(PACKET_FORMAT.tireSlipAngleRearLeft);
  data.tireSlipAngleRearRight = readFloat32(PACKET_FORMAT.tireSlipAngleRearRight);

  // Tire combined slip
  data.tireCombinedSlipFrontLeft = readFloat32(PACKET_FORMAT.tireCombinedSlipFrontLeft);
  data.tireCombinedSlipFrontRight = readFloat32(PACKET_FORMAT.tireCombinedSlipFrontRight);
  data.tireCombinedSlipRearLeft = readFloat32(PACKET_FORMAT.tireCombinedSlipRearLeft);
  data.tireCombinedSlipRearRight = readFloat32(PACKET_FORMAT.tireCombinedSlipRearRight);

  // Wheel rotation speeds (rad/s to RPM)
  data.wheelRPMFrontLeft = (readFloat32(PACKET_FORMAT.wheelRotationSpeedFrontLeft) * 9.5493);
  data.wheelRPMFrontRight = (readFloat32(PACKET_FORMAT.wheelRotationSpeedFrontRight) * 9.5493);
  data.wheelRPMRearLeft = (readFloat32(PACKET_FORMAT.wheelRotationSpeedRearLeft) * 9.5493);
  data.wheelRPMRearRight = (readFloat32(PACKET_FORMAT.wheelRotationSpeedRearRight) * 9.5493);

  // Timing
  data.lastLapTime = readFloat32(PACKET_FORMAT.lastLapTime);
  data.currentLapTime = readFloat32(PACKET_FORMAT.currentLapTime);
  data.bestLapTime = readFloat32(PACKET_FORMAT.bestLapTime);
  data.lapNumber = readInt32(PACKET_FORMAT.lapNumber);

  // Race info
  data.racePosition = readInt32(PACKET_FORMAT.racePosition);
  data.numCars = readInt32(PACKET_FORMAT.numCars);
  data.sessionType = readInt32(PACKET_FORMAT.sessionType);

  // Tire temperatures (Celsius to Fahrenheit for display)
  data.tireTempFrontLeft = readFloat32(PACKET_FORMAT.tireTempFrontLeft) * 9/5 + 32;
  data.tireTempFrontRight = readFloat32(PACKET_FORMAT.tireTempFrontRight) * 9/5 + 32;
  data.tireTempRearLeft = readFloat32(PACKET_FORMAT.tireTempRearLeft) * 9/5 + 32;
  data.tireTempRearRight = readFloat32(PACKET_FORMAT.tireTempRearRight) * 9/5 + 32;

  // Brake temperatures (Celsius to Fahrenheit)
  data.brakeTempFrontLeft = readFloat32(PACKET_FORMAT.brakeTempFrontLeft) * 9/5 + 32;
  data.brakeTempFrontRight = readFloat32(PACKET_FORMAT.brakeTempFrontRight) * 9/5 + 32;
  data.brakeTempRearLeft = readFloat32(PACKET_FORMAT.brakeTempRearLeft) * 9/5 + 32;
  data.brakeTempRearRight = readFloat32(PACKET_FORMAT.brakeTempRearRight) * 9/5 + 32;

  // Pedal positions
  data.clutchPedal = readFloat32(PACKET_FORMAT.clutchPedal);
  data.throttlePedal = readFloat32(PACKET_FORMAT.throttlePedal);
  data.brakePedal = readFloat32(PACKET_FORMAT.brakePedal);

  // Fuel
  data.fuelLevel = readFloat32(PACKET_FORMAT.fuelLevel);
  data.fuelCapacity = readFloat32(PACKET_FORMAT.fuelCapacity);

  // Speed in multiple units
  data.speedMS = readFloat32(PACKET_FORMAT.speed);
  data.speedKmh = readFloat32(PACKET_FORMAT.speedKmh);
  data.speedMph = readFloat32(PACKET_FORMAT.speedMph);

  // Engine vitals
  data.turboBoost = readFloat32(PACKET_FORMAT.turboBoost);
  data.oilTemp = readFloat32(PACKET_FORMAT.oilTemp) * 9/5 + 32;
  data.oilPressure = readFloat32(PACKET_FORMAT.oilPressure);
  data.waterTemp = readFloat32(PACKET_FORMAT.waterTemp) * 9/5 + 32;
  data.fuelPressure = readFloat32(PACKET_FORMAT.fuelPressure);
  data.fuelConsumption = readFloat32(PACKET_FORMAT.fuelConsumption);

  // Transmission
  data.currentGear = readInt32(PACKET_FORMAT.currentGear);
  data.suggestedGear = readInt32(PACKET_FORMAT.suggestedGear);
  data.throttle = readFloat32(PACKET_FORMAT.throttle);
  data.brake = readFloat32(PACKET_FORMAT.brake);
  data.clutch = readFloat32(PACKET_FORMAT.clutch);

  // Power
  data.engineTorque = readFloat32(PACKET_FORMAT.engineTorque);
  data.enginePower = readFloat32(PACKET_FORMAT.enginePower);

  // Tire wear (0.0 = worn out, 1.0 = new)
  data.tireWearFrontLeft = readFloat32(PACKET_FORMAT.tireWearFrontLeft);
  data.tireWearFrontRight = readFloat32(PACKET_FORMAT.tireWearFrontRight);
  data.tireWearRearLeft = readFloat32(PACKET_FORMAT.tireWearRearLeft);
  data.tireWearRearRight = readFloat32(PACKET_FORMAT.tireWearRearRight);

  // Add metadata
  data.timestamp = Date.now();
  data.packetCount = packetCount;

  return data;
}

// HTML test page
function getTestPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forza Telemetry Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #111; color: #fff; }
        .metric { background: #222; padding: 10px; margin: 5px; border-radius: 5px; display: inline-block; min-width: 150px; }
        .value { font-size: 18px; font-weight: bold; color: #4CAF50; }
        .label { font-size: 12px; color: #888; }
        .status { color: #2196F3; font-weight: bold; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .success { color: #4CAF50; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
    </style>
</head>
<body>
    <h1>Forza Telemetry Test Page</h1>
    <div id="status" class="status">Connecting...</div>

    <h2>Live Telemetry Data</h2>
    <div class="grid" id="metrics">
        <div class="metric">
            <div class="value" id="speed">--</div>
            <div class="label">Speed (MPH)</div>
        </div>
        <div class="metric">
            <div class="value" id="rpm">--</div>
            <div class="label">Engine RPM</div>
        </div>
        <div class="metric">
            <div class="value" id="gear">--</div>
            <div class="label">Current Gear</div>
        </div>
        <div class="metric">
            <div class="value" id="throttle">--</div>
            <div class="label">Throttle (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="brake">--</div>
            <div class="label">Brake (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="fl">--</div>
            <div class="label">FL Suspension (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="fr">--</div>
            <div class="label">FR Suspension (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="rl">--</div>
            <div class="label">RL Suspension (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="rr">--</div>
            <div class="label">RR Suspension (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="tireTempFL">--</div>
            <div class="label">FL Tire Temp (°F)</div>
        </div>
        <div class="metric">
            <div class="value" id="tireTempFR">--</div>
            <div class="label">FR Tire Temp (°F)</div>
        </div>
        <div class="metric">
            <div class="value" id="tireTempRL">--</div>
            <div class="label">RL Tire Temp (°F)</div>
        </div>
        <div class="metric">
            <div class="value" id="tireTempRR">--</div>
            <div class="label">RR Tire Temp (°F)</div>
        </div>
        <div class="metric">
            <div class="value" id="fuel">--</div>
            <div class="label">Fuel Level (%)</div>
        </div>
        <div class="metric">
            <div class="value" id="lapTime">--</div>
            <div class="label">Current Lap Time</div>
        </div>
        <div class="metric">
            <div class="value" id="lapNumber">--</div>
            <div class="label">Lap Number</div>
        </div>
        <div class="metric">
            <div class="value" id="position">--</div>
            <div class="label">Race Position</div>
        </div>
    </div>

    <h2>Raw Data</h2>
    <pre id="rawData">Waiting for telemetry data...</pre>

    <script>
        const status = document.getElementById('status');
        const rawData = document.getElementById('rawData');
        let ws;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10;

        function connect() {
            status.textContent = 'Connecting...';
            status.className = 'status';

            try {
                ws = new WebSocket('ws://' + window.location.host.replace('8080', '8765'));

                ws.onopen = function(event) {
                    status.textContent = '✅ Connected to telemetry server';
                    status.className = 'success';
                    reconnectAttempts = 0;
                };

                ws.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        updateDisplay(data);
                        rawData.textContent = JSON.stringify(data, null, 2);
                    } catch (e) {
                        console.error('Error parsing telemetry data:', e);
                    }
                };

                ws.onclose = function(event) {
                    status.textContent = '❌ Disconnected from telemetry server';
                    status.className = 'error';

                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        setTimeout(connect, 2000);
                        status.textContent += ' - Reconnecting...';
                    }
                };

                ws.onerror = function(error) {
                    status.textContent = '❌ WebSocket error: ' + error.message;
                    status.className = 'error';
                };

            } catch (error) {
                status.textContent = '❌ Failed to create WebSocket connection';
                status.className = 'error';
            }
        }

        function updateDisplay(data) {
            // Update metrics
            document.getElementById('speed').textContent = Math.round(data.speedMph || 0);
            document.getElementById('rpm').textContent = Math.round(data.currentEngineRpm || 0);
            document.getElementById('gear').textContent = data.currentGear || 0;
            document.getElementById('throttle').textContent = Math.round((data.throttlePedal || 0) * 100);
            document.getElementById('brake').textContent = Math.round((data.brakePedal || 0) * 100);

            // Suspension travel (convert to percentage)
            document.getElementById('fl').textContent = Math.round((data.suspensionTravelFrontLeft || 0) * 100);
            document.getElementById('fr').textContent = Math.round((data.suspensionTravelFrontRight || 0) * 100);
            document.getElementById('rl').textContent = Math.round((data.suspensionTravelRearLeft || 0) * 100);
            document.getElementById('rr').textContent = Math.round((data.suspensionTravelRearRight || 0) * 100);

            // Tire temperatures
            document.getElementById('tireTempFL').textContent = Math.round(data.tireTempFrontLeft || 0);
            document.getElementById('tireTempFR').textContent = Math.round(data.tireTempFrontRight || 0);
            document.getElementById('tireTempRL').textContent = Math.round(data.tireTempRearLeft || 0);
            document.getElementById('tireTempRR').textContent = Math.round(data.tireTempRearRight || 0);

            // Fuel and timing
            document.getElementById('fuel').textContent = Math.round((data.fuelLevel || 0) * 100);
            document.getElementById('lapTime').textContent = formatTime(data.currentLapTime || 0);
            document.getElementById('lapNumber').textContent = data.lapNumber || 0;
            document.getElementById('position').textContent = data.racePosition || 0;
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = (seconds % 60).toFixed(2);
            return mins + ':' + secs.padStart(5, '0');
        }

        // Connect on page load
        connect();

        // Auto-refresh raw data display
        setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                // Connection is healthy
            }
        }, 1000);
    </script>
</body>
</html>`;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down telemetry relay server...');
  udpServer.close();
  wss.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down telemetry relay server...');
  udpServer.close();
  wss.close();
  httpServer.close();
  process.exit(0);
});

// Export for use as module
module.exports = {
  parseForzaPacket,
  PACKET_FORMAT,
  PACKET_SIZE
};