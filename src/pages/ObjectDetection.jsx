import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import AnimatedBackground from '../components/AnimatedBackground';

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Loading model...');
  const [, setDetections] = useState([]);
  const [facingMode, setFacingMode] = useState('user');

  // Cache translations
  const translationCache = useRef({});

  const translateToGerman = async (text) => {
    if (translationCache.current[text]) {
      return translationCache.current[text];
    }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=de&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      const translated = data?.[0]?.[0]?.[0] || text;
      translationCache.current[text] = translated;
      return translated;
    } catch (err) {
      console.error('Google Translate failed:', err);
      return text;
    }
  };

  const startCamera = async (facing) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing }
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const switchCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await startCamera(newFacing);
  };

  useEffect(() => {
    let animFrameId;
    let running = true;

    const resizeObserver = new ResizeObserver(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
      }
    });

    const setup = async () => {
      try {
        await startCamera(facingMode);

        resizeObserver.observe(videoRef.current);

        setStatus('Loading Exzellents AI model...');

        const model = await cocoSsd.load();
        setStatus('Model loaded – detecting...');

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const detectLoop = async () => {
          if (!running) return;

          const video = videoRef.current;
          if (video && video.readyState === 4) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const predictions = await model.detect(video);

            const translatedPreds = await Promise.all(
              predictions.map(async (pred) => ({
                ...pred,
                germanLabel: await translateToGerman(pred.class)
              }))
            );

            setDetections(translatedPreds);

            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;

            translatedPreds.forEach(({ germanLabel, score, bbox }) => {
              const [x, y, width, height] = [
                bbox[0] * scaleX,
                bbox[1] * scaleY,
                bbox[2] * scaleX,
                bbox[3] * scaleY,
              ];

              // --- Rounded bounding box ---
              const radius = 8;
              ctx.strokeStyle = '#6C47FF';
              ctx.lineWidth = 5;
              ctx.beginPath();
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + width - radius, y);
              ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
              ctx.lineTo(x + width, y + height - radius);
              ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
              ctx.lineTo(x + radius, y + height);
              ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
              ctx.stroke();

              // --- Label background with rounded corners ---
              const text = `${germanLabel} ${(score * 100).toFixed(0)}%`;
              ctx.font = 'bold 22px sans-serif';
              const textWidth = ctx.measureText(text).width;
              const labelHeight = 28;
              const labelWidth = textWidth + 16;
              const labelX = x;
              const labelY = y - labelHeight;
              const labelRadius = 6;

              ctx.fillStyle = '#6C47FF';
              ctx.beginPath();
              ctx.moveTo(labelX + labelRadius, labelY);
              ctx.lineTo(labelX + labelWidth - labelRadius, labelY);
              ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + labelRadius);
              ctx.lineTo(labelX + labelWidth, labelY + labelHeight - labelRadius);
              ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - labelRadius, labelY + labelHeight);
              ctx.lineTo(labelX + labelRadius, labelY + labelHeight);
              ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - labelRadius);
              ctx.lineTo(labelX, labelY + labelRadius);
              ctx.quadraticCurveTo(labelX, labelY, labelX + labelRadius, labelY);
              ctx.closePath();
              ctx.fill();

              // --- White text ---
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(text, labelX + 8, labelY + 19);
            });
          }

          await new Promise(r => setTimeout(r, 500));
          animFrameId = requestAnimationFrame(detectLoop);
        };

        detectLoop();
      } catch (err) {
        setStatus('Error: ' + err.message);
        console.error('Setup failed:', err);
      }
    };

    setup();

    return () => {
      running = false;
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <>
      <div className="min-h-screen">
        <AnimatedBackground />
        <div className='relative text-center'>
          <div className='bg-bg pt-35 pb-10 border-b-2 border-border'>
            <p className='text-primary md:text-7xl text-4xl text-wrap font-bold'>
              <span className='text-white'>Exzellent's</span> Object recognition (German)
            </p>
          </div>

          <p className={`${status.includes('Error') ? 'text-red-500' : 'text-secondary'} font-bold text-3xl mt-5`}>
            {status}
          </p>

          <div className='m-5 flex justify-center'>
            <div className='relative w-fit'>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className=" rounded-xl w-full max-w-2xl"
              />
              <canvas
                ref={canvasRef}
                className='absolute top-0 left-0 w-full h-full rounded-xl'
              />
              {/* Camera switch button */}
              <button
                onClick={switchCamera}
                className="lg:hidden absolute bottom-3 right-3 bg-secondary text-white px-3 py-2 rounded-xl text-sm font-bold opacity-80 hover:opacity-100 transition"
              >
                🔄 Switch Camera
              </button>
            </div>
          </div>

          <p className='text-white text-lg'>
            Point the camera at objects, they will be automatically recognized and labelled in German!
          </p>
        </div>
      </div>
    </>
  );
};

export default ObjectDetection;