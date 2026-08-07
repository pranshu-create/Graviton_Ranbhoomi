"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload } from 'lucide-react';

const QRScanner = forwardRef(({ onScanSuccess, onScanFailure }, ref) => {
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [scannerId] = useState(() => "qr-reader-" + Math.random().toString(36).substr(2, 9));

  useImperativeHandle(ref, () => ({
    resume: () => {
      if (html5QrCodeRef.current && isScanning) {
        try {
          html5QrCodeRef.current.resume();
        } catch (e) {
          console.error("Could not resume scanner", e);
        }
      }
    }
  }));

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode(scannerId);

    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, [scannerId]);

  const startCamera = async () => {
    try {
      if (isScanning) {
        await stopCamera();
      }
      setIsScanning(true);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5QrCodeRef.current.pause(true);
          onScanSuccess(decodedText);
        },
        (error) => {
          if (onScanFailure) onScanFailure(error);
        }
      );
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      alert("Error starting camera. Please ensure you have granted camera permissions.");
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping camera", err);
        // Fallback: force state to false anyway
        setIsScanning(false);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (html5QrCodeRef.current && isScanning) {
        await stopCamera();
    }

    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error(err);
      alert("No QR code found in the image. Please try another image.");
    }
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <div className="flex gap-4 mb-4 w-full">
        <button 
          onClick={isScanning ? stopCamera : startCamera}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors ${
            isScanning 
              ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-black" 
              : "bg-neon-cyan/20 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
          }`}
          style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
        >
          <Camera className="w-4 h-4" />
          {isScanning ? "STOP CAMERA" : "SCAN CAMERA"}
        </button>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-yellow-500 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors"
          style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
        >
          <Upload className="w-4 h-4" />
          UPLOAD IMAGE
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="relative w-full min-h-[300px] border-2 border-neon-cyan/50 bg-black/50 overflow-hidden" style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}>
        <div id={scannerId} className="w-full h-full flex items-center justify-center relative z-0"></div>
        
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none z-10 bg-black/50">
            <Camera className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-xs uppercase tracking-widest">CAMERA INACTIVE</p>
          </div>
        )}
      </div>
    </div>
  );
});

QRScanner.displayName = 'QRScanner';

export default QRScanner;
