import React, { useEffect } from 'react';
import { 
  X, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Volume2, 
  RefreshCw, 
  Cast, 
  Radio, 
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { SyncedDevice } from '../../hooks/useDeviceSync';
import { LocalDeviceInfo } from '../../utils/deviceInfo';

interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  localDevice: LocalDeviceInfo;
  devices: SyncedDevice[];
  isSyncing: boolean;
  onRefresh: () => void;
  onTransferTo: (targetDeviceId: string) => void;
  onTransferHere: (device: SyncedDevice) => void;
}

export const DeviceConnectModal: React.FC<DeviceConnectModalProps> = ({
  isOpen,
  onClose,
  localDevice,
  devices,
  isSyncing,
  onRefresh,
  onTransferTo,
  onTransferHere
}) => {
  useEffect(() => {
    if (isOpen) {
      onRefresh();
    }
  }, [isOpen, onRefresh]);

  if (!isOpen) return null;

  const getDeviceIcon = (type: 'mobile' | 'tablet' | 'desktop', className = 'w-5 h-5') => {
    switch (type) {
      case 'mobile':
        return <Smartphone className={className} />;
      case 'tablet':
        return <Tablet className={className} />;
      default:
        return <Laptop className={className} />;
    }
  };

  const otherDevices = devices.filter(d => d.deviceId !== localDevice.deviceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#242424] border border-white/10 rounded-2xl shadow-2xl p-5 text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-spotify-green/20 text-spotify-green flex items-center justify-center">
              <Cast className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Connect to a Device</h3>
              <p className="text-xs text-zinc-400">Sync & control playback between devices</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh devices"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-spotify-green' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Device Card */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Current Device</span>
          <div className="mt-2 flex items-center justify-between p-3 rounded-xl bg-spotify-green/10 border border-spotify-green/30">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-spotify-green text-black flex items-center justify-center flex-shrink-0">
                {getDeviceIcon(localDevice.deviceType, 'w-5 h-5 stroke-[2.5]')}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-spotify-green truncate">{localDevice.deviceName}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-spotify-green/20 text-spotify-green">
                    This Device
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-spotify-green animate-pulse" />
                  <span>Ready & Listening</span>
                </div>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-spotify-green shrink-0" />
          </div>
        </div>

        {/* Other Detected Devices */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Other Active Devices ({otherDevices.length})
            </span>
            <span className="text-[11px] text-zinc-500">Auto-discovering on LAN</span>
          </div>

          <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-1">
            {otherDevices.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center space-y-2">
                <Radio className="w-7 h-7 text-zinc-500 mx-auto animate-pulse" />
                <p className="text-xs text-zinc-300 font-medium">Looking for other devices...</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  Open MySpoti on your phone, tablet, or another browser tab on the same network to control playback remotely.
                </p>
              </div>
            ) : (
              otherDevices.map((d) => (
                <div
                  key={d.deviceId}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 group-hover:text-spotify-green group-hover:bg-zinc-700 transition-colors">
                      {getDeviceIcon(d.deviceType, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{d.deviceName}</p>
                      <p className="text-xs text-zinc-400 truncate">
                        {d.isPlaying && d.trackTitle ? (
                          <span className="text-spotify-green flex items-center gap-1">
                            <Volume2 className="w-3 h-3 inline" /> Playing: {d.trackTitle}
                          </span>
                        ) : (
                          'Active on network'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {d.isPlaying && d.currentTrackId ? (
                      <button
                        onClick={() => {
                          onTransferHere(d);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-spotify-green hover:text-black text-xs font-semibold text-white transition-all"
                        title="Pull playback to this device"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Play Here</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onTransferTo(d.deviceId);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-spotify-green hover:bg-[#1ed760] text-black text-xs font-bold transition-all shadow-sm"
                        title="Transfer playback to this device"
                      >
                        <Cast className="w-3 h-3" />
                        <span>Send Audio</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Synced with MySpoti Cloud</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-white hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
