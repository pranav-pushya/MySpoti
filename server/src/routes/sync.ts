import { Router, Request, Response } from 'express';

const router = Router();

export interface ConnectedDevice {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  currentTrackId: string | null;
  trackTitle?: string;
  trackArtist?: string;
  isPlaying: boolean;
  currentTime: number;
  lastActive: number;
}

export interface RemoteCommand {
  id: string;
  command: 'play' | 'pause' | 'next' | 'prev' | 'seek' | 'transferTrack';
  targetDeviceId: string;
  trackId?: string;
  currentTime?: number;
  timestamp: number;
}

// In-memory registry for real-time device sessions
const activeDevices = new Map<string, ConnectedDevice>();
const pendingCommands = new Map<string, RemoteCommand[]>();

// Prune inactive devices (> 45s since last heartbeat)
const pruneInactiveDevices = () => {
  const now = Date.now();
  for (const [id, device] of activeDevices.entries()) {
    if (now - device.lastActive > 45000) {
      activeDevices.delete(id);
      pendingCommands.delete(id);
    }
  }
};

/**
 * POST /api/sync/heartbeat
 * Heartbeat from a connected device updating its state.
 */
router.post('/heartbeat', (req: Request, res: Response) => {
  const {
    deviceId,
    deviceName,
    deviceType,
    currentTrackId,
    trackTitle,
    trackArtist,
    isPlaying,
    currentTime
  } = req.body;

  if (!deviceId) {
    res.status(400).json({ error: 'deviceId is required' });
    return;
  }

  const device: ConnectedDevice = {
    deviceId,
    deviceName: deviceName || 'Unknown Device',
    deviceType: deviceType || 'desktop',
    currentTrackId: currentTrackId || null,
    trackTitle,
    trackArtist,
    isPlaying: Boolean(isPlaying),
    currentTime: typeof currentTime === 'number' ? currentTime : 0,
    lastActive: Date.now()
  };

  activeDevices.set(deviceId, device);
  pruneInactiveDevices();

  // Return any pending commands for this device
  const commands = pendingCommands.get(deviceId) || [];
  if (commands.length > 0) {
    pendingCommands.delete(deviceId);
  }

  res.json({
    status: 'ok',
    commands,
    activeDeviceCount: activeDevices.size
  });
});

/**
 * GET /api/sync/devices
 * Lists all active devices on the network.
 */
router.get('/devices', (req: Request, res: Response) => {
  pruneInactiveDevices();
  const devices = Array.from(activeDevices.values());
  res.json({
    devices,
    timestamp: Date.now()
  });
});

/**
 * POST /api/sync/command
 * Send a remote playback control command to a target device.
 */
router.post('/command', (req: Request, res: Response) => {
  const { targetDeviceId, command, trackId, currentTime } = req.body;

  if (!targetDeviceId || !command) {
    res.status(400).json({ error: 'targetDeviceId and command are required' });
    return;
  }

  const cmd: RemoteCommand = {
    id: Math.random().toString(36).substring(2, 9),
    command,
    targetDeviceId,
    trackId,
    currentTime,
    timestamp: Date.now()
  };

  const existing = pendingCommands.get(targetDeviceId) || [];
  existing.push(cmd);
  pendingCommands.set(targetDeviceId, existing);

  res.json({
    status: 'ok',
    delivered: true,
    commandId: cmd.id
  });
});

export default router;
