# Firewall Setup for Mobile Device Testing

## Quick Fix for Windows Firewall

Your phone needs to be able to connect to your computer on port 3000. Follow these steps:

### Option 1: Add Firewall Rule (Recommended)
1. Open Windows Defender Firewall
2. Click "Advanced settings" on the left
3. Click "Inbound Rules" on the left
4. Click "New Rule" on the right
5. Select "Port" → Next
6. Select "TCP" and "Specific local ports"
7. Enter `3000` → Next
8. Select "Allow the connection" → Next
9. Check all profiles → Next
10. Name it "Node Server Port 3000" → Finish

### Option 2: Temporary Test (Quick but Less Secure)
1. Open Windows Defender Firewall
2. Click "Turn Windows Defender Firewall on or off"
3. Temporarily turn OFF firewall for "Private networks"
4. Test the app
5. Turn it back ON afterwards

## Verify Phone Can Connect

From your phone's browser, try opening:
```
http://10.0.0.217:3000
```

You should see "Hello from Node.js backend!"

## Troubleshooting

If it still doesn't work:
- Make sure phone and computer are on the SAME WiFi network
- Some networks (like hotels) block device-to-device communication
- Try using a mobile hotspot or connect both to a personal WiFi router

