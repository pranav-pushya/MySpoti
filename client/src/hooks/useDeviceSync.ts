import { useEffect, useState, useCallback, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { getLocalDeviceInfo, LocalDeviceInfo } from '../utils/deviceInfo';
import { getApiUrl } from '../config/api';
import { Track } from '../types';

export interface SyncedDevice {
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

export const useDeviceSync = (allTracks: Track[] = []) => {
  const [localDevice] = useState<LocalDeviceInfo>(getLocalDeviceInfo);
  const [devices, setDevices] = useState<SyncedDevice[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const tracksRef = useRef<Track[]>(allTracks);

  useEffect(() => {
    tracksRef.current = allTracks;
  }, [allTracks]);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    playTrack,
    togglePlay,
    pause,
    nextTrack,
    prevTrack,
    seek
  } = usePlayerStore();

  // Handle remote command execution on this device
  const executeRemoteCommand = useCallback((cmd: {
    command: string;
    trackId?: string;
    currentTime?: number;
  }) => {
    switch (cmd.command) {
      case 'play':
        if (!isPlaying) togglePlay();
        break;
      case 'pause':
        if (isPlaying) pause();
        break;
      case 'next':
        nextTrack();
        break;
      case 'prev':
        prevTrack();
        break;
      case 'seek':
        if (typeof cmd.currentTime === 'number') {
          seek(cmd.currentTime);
        }
        break;
      case 'transferTrack':
        if (cmd.trackId) {
          const target = tracksRef.current.find(t => t.id === cmd.trackId);
          if (target) {
            playTrack(target, tracksRef.current);
            if (typeof cmd.currentTime === 'number' && cmd.currentTime > 0) {
              setTimeout(() => seek(cmd.currentTime!), 200);
            }
          }
        }
        break;
      default:
        break;
    }
  }, [isPlaying, togglePlay, pause, nextTrack, prevTrack, seek, playTrack]);

  // Heartbeat loop
  useEffect(() => {
    let isCancelled = false;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch(getApiUrl('/api/sync/heartbeat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: localDevice.deviceId,
            deviceName: localDevice.deviceName,
            deviceType: localDevice.deviceType,
            currentTrackId: currentTrack?.id || null,
            trackTitle: currentTrack?.title,
            trackArtist: currentTrack?.artist,
            isPlaying,
            currentTime: Math.floor(currentTime)
          })
        });

        if (!res.ok) return;
        const data = await res.json();

        // Process any received remote commands
        if (data.commands && Array.isArray(data.commands) && data.commands.length > 0) {
          for (const cmd of data.commands) {
            executeRemoteCommand(cmd);
          }
        }
      } catch {
        // network silent fail
      }
    };

    // Run heartbeat every 4 seconds
    const interval = setInterval(() => {
      if (!isCancelled) sendHeartbeat();
    }, 4000);

    // Initial heartbeat
    sendHeartbeat();

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [localDevice, currentTrack, isPlaying, currentTime, executeRemoteCommand]);

  // Fetch all active devices
  const refreshDevices = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(getApiUrl('/api/sync/devices'));
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Send command to remote device
  const sendCommand = useCallback(async (
    targetDeviceId: string,
    command: 'play' | 'pause' | 'next' | 'prev' | 'seek' | 'transferTrack',
    extra?: { trackId?: string; currentTime?: number }
  ) => {
    try {
      await fetch(getApiUrl('/api/sync/command'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDeviceId,
          command,
          ...extra
        })
      });
      await refreshDevices();
    } catch (err) {
      console.error('Failed to send remote command:', err);
    }
  }, [refreshDevices]);

  // Transfer playback to another device
  const transferPlaybackTo = useCallback(async (targetDeviceId: string) => {
    if (!currentTrack) return;
    await sendCommand(targetDeviceId, 'transferTrack', {
      trackId: currentTrack.id,
      currentTime: Math.floor(currentTime)
    });
    // Pause playback on current device
    pause();
  }, [currentTrack, currentTime, sendCommand, pause]);

  // Pull playback from another device to this local device
  const transferPlaybackHere = useCallback((remoteDevice: SyncedDevice) => {
    if (!remoteDevice.currentTrackId) return;
    const target = tracksRef.current.find(t => t.id === remoteDevice.currentTrackId);
    if (target) {
      playTrack(target, tracksRef.current);
      if (remoteDevice.currentTime > 0) {
        setTimeout(() => seek(remoteDevice.currentTime), 200);
      }
      // Send pause to the other device so only this device plays
      sendCommand(remoteDevice.deviceId, 'pause');
    }
  }, [playTrack, seek, sendCommand]);

  return {
    localDevice,
    devices,
    isSyncing,
    refreshDevices,
    sendCommand,
    transferPlaybackTo,
    transferPlaybackHere
  };
};
