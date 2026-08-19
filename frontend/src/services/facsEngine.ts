/**
 * Real-Time Facial Action Coding System (FACS) Biometric Engine
 * Uses MediaPipe 468 3D Landmark Geometry for Invariant Facial Sentiment Recognition
 * 
 * Based on Paul Ekman's Facial Action Coding System:
 * - AU12 (Zygomaticus Major / Lip Corner Puller): Smile / Happy
 * - AU4  (Corrugator Supercilii / Brow Lowerer): Brow Furrow / Angry
 * - AU15 (Depressor Anguli Oris) + AU1 (Inner Brow Raiser): Frown / Sad
 * - Baseline Equilibrium: Neutral
 */

import { FaceMesh, Results, NormalizedLandmarkList } from '@mediapipe/face_mesh';

export type EmotionType = 'Happy' | 'Sad' | 'Neutral' | 'Angry';

export interface ActionUnitMetrics {
  au12_smile: number;          // Lip corner puller & elevator [0..1]
  au4_brow_furrow: number;     // Eyebrow contraction & descent [0..1]
  au15_lip_depress: number;    // Mouth corner depression [0..1]
  au1_inner_brow_raise: number;// Inner brow elevation [0..1]
  au25_lip_part: number;       // Mouth opening / jaw descent [0..1]
  faceScale: number;           // Inter-facial vertical scale [px]
}

export interface FACSPrediction {
  primary: EmotionType;
  confidence: number;
  scores: { emotion: EmotionType; score: number; color: string }[];
  actionUnits: ActionUnitMetrics;
  landmarksDetected: boolean;
  rawLandmarks?: NormalizedLandmarkList;
}

export const EMOTION_COLORS: Record<EmotionType, string> = {
  Happy: '#10b981',    // Emerald
  Sad: '#3b82f6',      // Blue
  Neutral: '#8b5cf6',  // Purple
  Angry: '#ef4444'     // Rose / Red
};

// Rolling Exponential Moving Average (EMA) state for smooth transitions
let smoothedScores: Record<EmotionType, number> = {
  Happy: 0.25,
  Sad: 0.25,
  Neutral: 0.25,
  Angry: 0.25
};

const EMA_ALPHA = 0.40; // 40% current frame, 60% historical for jitter-free stability

/**
 * Key MediaPipe Landmark Indices (468 3D points)
 */
export const LANDMARK_INDEX = {
  // Forehead & Chin (Face vertical scale)
  FOREHEAD_TOP: 10,
  CHIN_BOTTOM: 152,
  
  // Nose
  NOSE_TIP: 1,
  GLABELLA_MID_BROW: 9,

  // Mouth
  MOUTH_LEFT_CORNER: 61,
  MOUTH_RIGHT_CORNER: 291,
  UPPER_LIP_CENTER: 13,
  LOWER_LIP_CENTER: 14,
  UPPER_LIP_TOP: 0,
  LOWER_LIP_BOTTOM: 17,

  // Eyebrows
  LEFT_EYEBROW_INNER: 55,
  LEFT_EYEBROW_MID: 107,
  LEFT_EYEBROW_OUTER: 70,
  RIGHT_EYEBROW_INNER: 285,
  RIGHT_EYEBROW_MID: 336,
  RIGHT_EYEBROW_OUTER: 300,

  // Eyes (for vertical alignment and brow-to-eye distance)
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,

  // Cheeks
  LEFT_CHEEK: 116,
  RIGHT_CHEEK: 345
};

/**
 * Calculate Euclidean 2D distance between two landmarks
 */
function dist2D(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Compute FACS Action Unit Metrics from 468 3D Normalized Landmarks
 */
export function computeActionUnits(landmarks: NormalizedLandmarkList): ActionUnitMetrics {
  const p = (idx: number) => landmarks[idx] || { x: 0, y: 0, z: 0 };

  // 1. Vertical Face Height Scale (Chin to Forehead Top)
  const faceScale = dist2D(p(LANDMARK_INDEX.CHIN_BOTTOM), p(LANDMARK_INDEX.FOREHEAD_TOP)) || 0.001;

  // 2. AU12: Zygomaticus Major (Mouth Corner Elevation & Width Expansion)
  const mouthWidth = dist2D(p(LANDMARK_INDEX.MOUTH_LEFT_CORNER), p(LANDMARK_INDEX.MOUTH_RIGHT_CORNER)) / faceScale;
  const mouthCornersAvgY = (p(LANDMARK_INDEX.MOUTH_LEFT_CORNER).y + p(LANDMARK_INDEX.MOUTH_RIGHT_CORNER).y) / 2;
  const upperLipCenterY = p(LANDMARK_INDEX.UPPER_LIP_CENTER).y;
  // In screen coordinates, y increases downward. If corners are higher than lip center, (lipCenter.y - corners.y) > 0
  const cornerLift = (upperLipCenterY - mouthCornersAvgY) / faceScale;

  // AU12 formula: scaled combination of corner elevation and mouth stretch
  const au12_raw = (cornerLift * 18.0) + ((mouthWidth - 0.45) * 4.0);
  const au12_smile = Math.max(0, Math.min(1, au12_raw));

  // 3. AU4: Corrugator Supercilii (Eyebrow Inward Pull & Lowering / Furrow)
  const browDistance = dist2D(p(LANDMARK_INDEX.LEFT_EYEBROW_INNER), p(LANDMARK_INDEX.RIGHT_EYEBROW_INNER)) / faceScale;
  const leftBrowEyeGap = (p(LANDMARK_INDEX.LEFT_EYE_TOP).y - p(LANDMARK_INDEX.LEFT_EYEBROW_INNER).y) / faceScale;
  const rightBrowEyeGap = (p(LANDMARK_INDEX.RIGHT_EYE_TOP).y - p(LANDMARK_INDEX.RIGHT_EYEBROW_INNER).y) / faceScale;
  const avgBrowEyeGap = (leftBrowEyeGap + rightBrowEyeGap) / 2;

  // When angry/furrowed: browDistance drops (< 0.16) and avgBrowEyeGap drops (< 0.08)
  const browContraction = Math.max(0, (0.175 - browDistance) * 14.0);
  const browDescent = Math.max(0, (0.095 - avgBrowEyeGap) * 16.0);
  const au4_raw = (browContraction * 0.55) + (browDescent * 0.45);
  const au4_brow_furrow = Math.max(0, Math.min(1, au4_raw));

  // 4. AU15: Depressor Anguli Oris (Mouth Corner Droop / Frown)
  const lowerLipCenterY = p(LANDMARK_INDEX.LOWER_LIP_CENTER).y;
  // When corners pull downwards below the lower lip line: (corners.y - lowerLip.y) > 0
  const cornerDroop = (mouthCornersAvgY - lowerLipCenterY) / faceScale;
  const au15_raw = (cornerDroop - 0.015) * 22.0;
  const au15_lip_depress = Math.max(0, Math.min(1, au15_raw));

  // 5. AU1: Inner Brow Raiser (Medial Eyebrow Angled Upward / Distress)
  const leftInnerBrowRaise = (p(LANDMARK_INDEX.LEFT_EYEBROW_OUTER).y - p(LANDMARK_INDEX.LEFT_EYEBROW_INNER).y) / faceScale;
  const rightInnerBrowRaise = (p(LANDMARK_INDEX.RIGHT_EYEBROW_OUTER).y - p(LANDMARK_INDEX.RIGHT_EYEBROW_INNER).y) / faceScale;
  const avgInnerRaise = (leftInnerBrowRaise + rightInnerBrowRaise) / 2;
  const au1_raw = (avgInnerRaise - 0.01) * 15.0;
  const au1_inner_brow_raise = Math.max(0, Math.min(1, au1_raw));

  // 6. AU25: Lip Part / Mouth Opening
  const mouthHeight = dist2D(p(LANDMARK_INDEX.UPPER_LIP_CENTER), p(LANDMARK_INDEX.LOWER_LIP_CENTER)) / faceScale;
  const au25_lip_part = Math.max(0, Math.min(1, (mouthHeight - 0.03) * 12.0));

  return {
    au12_smile: parseFloat(au12_smile.toFixed(3)),
    au4_brow_furrow: parseFloat(au4_brow_furrow.toFixed(3)),
    au15_lip_depress: parseFloat(au15_lip_depress.toFixed(3)),
    au1_inner_brow_raise: parseFloat(au1_inner_brow_raise.toFixed(3)),
    au25_lip_part: parseFloat(au25_lip_part.toFixed(3)),
    faceScale: parseFloat((faceScale * 1000).toFixed(1))
  };
}

/**
 * Classify Emotion based on Facial Action Unit Vector
 */
export function classifyFACSEmotion(au: ActionUnitMetrics, applySmoothing = true): FACSPrediction {
  // Raw probability energy accumulator
  let rawHappy = 0.05;
  let rawSad = 0.05;
  let rawNeutral = 0.35;
  let rawAngry = 0.05;

  // 1. Happy: Driven primarily by AU12 (Smile / Lip Corner Puller)
  if (au.au12_smile > 0.20) {
    rawHappy += Math.pow(au.au12_smile, 1.4) * 3.2;
    rawNeutral = Math.max(0.02, rawNeutral - (au.au12_smile * 0.4));
  }

  // 2. Angry: Driven by AU4 (Brow Lowerer & Contraction)
  if (au.au4_brow_furrow > 0.25) {
    rawAngry += Math.pow(au.au4_brow_furrow, 1.4) * 3.0;
    rawNeutral = Math.max(0.02, rawNeutral - (au.au4_brow_furrow * 0.4));
  }

  // 3. Sad: Driven by AU15 (Lip Corner Depressor) + AU1 (Inner Brow Raiser)
  const sadSignal = (au.au15_lip_depress * 0.65) + (au.au1_inner_brow_raise * 0.35);
  if (sadSignal > 0.18 || au.au15_lip_depress > 0.22) {
    rawSad += Math.pow(sadSignal, 1.3) * 2.8;
    rawNeutral = Math.max(0.02, rawNeutral - (sadSignal * 0.35));
  }

  // 4. Neutral: Baseline equilibrium when all AU activations are low
  const totalAUActivation = au.au12_smile + au.au4_brow_furrow + au.au15_lip_depress;
  if (totalAUActivation < 0.35) {
    const stillness = (0.35 - totalAUActivation) / 0.35;
    rawNeutral += stillness * 1.8;
  }

  // Softmax normalization
  const sum = rawHappy + rawSad + rawNeutral + rawAngry;
  let currentScores: Record<EmotionType, number> = {
    Happy: rawHappy / sum,
    Sad: rawSad / sum,
    Neutral: rawNeutral / sum,
    Angry: rawAngry / sum
  };

  // Exponential Moving Average (EMA) smoothing for continuous real-time vision
  if (applySmoothing) {
    (Object.keys(smoothedScores) as EmotionType[]).forEach((key) => {
      smoothedScores[key] = (EMA_ALPHA * currentScores[key]) + ((1 - EMA_ALPHA) * smoothedScores[key]);
    });
  } else {
    smoothedScores = { ...currentScores };
  }

  const scoresList = (['Happy', 'Sad', 'Neutral', 'Angry'] as EmotionType[]).map((emotion) => ({
    emotion,
    score: parseFloat((smoothedScores[emotion] || currentScores[emotion]).toFixed(2)),
    color: EMOTION_COLORS[emotion]
  }));

  const best = scoresList.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

  return {
    primary: best.emotion,
    confidence: best.score,
    scores: scoresList,
    actionUnits: au,
    landmarksDetected: true
  };
}

/**
 * Singleton MediaPipe FaceMesh Instance Manager
 */
let faceMeshInstance: FaceMesh | null = null;
let isInitializing = false;
let initPromise: Promise<FaceMesh> | null = null;

export async function getFaceMeshInstance(): Promise<FaceMesh> {
  if (faceMeshInstance) return faceMeshInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    isInitializing = true;
    const mesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    mesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    await mesh.initialize();
    faceMeshInstance = mesh;
    isInitializing = false;
    return mesh;
  })();

  return initPromise;
}

/**
 * Helper to process an HTMLCanvasElement or Image and return FACS Prediction
 */
export async function analyzeImageWithFACS(inputElement: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): Promise<FACSPrediction> {
  const mesh = await getFaceMeshInstance();

  return new Promise<FACSPrediction>((resolve) => {
    const handleResults = (results: Results) => {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        // No face detected -> Return neutral resting fallback
        resolve({
          primary: 'Neutral',
          confidence: 0.65,
          scores: [
            { emotion: 'Happy', score: 0.10, color: EMOTION_COLORS.Happy },
            { emotion: 'Sad', score: 0.10, color: EMOTION_COLORS.Sad },
            { emotion: 'Neutral', score: 0.70, color: EMOTION_COLORS.Neutral },
            { emotion: 'Angry', score: 0.10, color: EMOTION_COLORS.Angry }
          ],
          actionUnits: {
            au12_smile: 0,
            au4_brow_furrow: 0,
            au15_lip_depress: 0,
            au1_inner_brow_raise: 0,
            au25_lip_part: 0,
            faceScale: 0
          },
          landmarksDetected: false
        });
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const au = computeActionUnits(landmarks);
      const prediction = classifyFACSEmotion(au, false);
      prediction.rawLandmarks = landmarks;
      resolve(prediction);
    };

    mesh.onResults(handleResults);
    mesh.send({ image: inputElement });
  });
}
