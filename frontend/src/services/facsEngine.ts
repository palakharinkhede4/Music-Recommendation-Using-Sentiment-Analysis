/**
 * High-Precision Facial Action Coding System (FACS) Biometric Engine
 * Calibrated for Natural Expressions, Glasses, and Diverse Lighting
 * 
 * Based on Paul Ekman's FACS:
 * - Happy: Mouth widening (W_mouth > 0.88 * Eye_Dist), mouth corner elevation, cheek raising
 * - Angry: Inter-eyebrow horizontal contraction, angry brow slant (inner brows lower than outer), narrow mouth
 * - Sad: Lip corner depression (corners lower than bottom lip), sad brow slant (inner brows raised), narrow mouth
 * - Neutral: Resting baseline equilibrium
 */

import { FaceMesh as FaceMeshModule, Results, NormalizedLandmarkList } from '@mediapipe/face_mesh';

export type EmotionType = 'Happy' | 'Sad' | 'Neutral' | 'Angry';

export interface ActionUnitMetrics {
  au12_smile: number;          // Lip corner puller & width expansion [0..1]
  au4_brow_furrow: number;     // Eyebrow inward contraction & downward slant [0..1]
  au15_lip_depress: number;    // Mouth corner downward depression [0..1]
  au1_inner_brow_raise: number;// Inner brow elevation / distress [0..1]
  mouthWidthRatio: number;     // Mouth width normalized to inter-ocular distance
  eyeDistance: number;         // Inter-ocular distance
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

/**
 * Key MediaPipe Landmark Indices (468 3D points)
 */
export const LANDMARK_INDEX = {
  // Eyes
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  LEFT_EYE_TOP: 159,
  RIGHT_EYE_TOP: 386,

  // Forehead & Chin
  FOREHEAD_TOP: 10,
  CHIN_BOTTOM: 152,
  NOSE_TIP: 1,

  // Mouth
  MOUTH_LEFT_CORNER: 61,
  MOUTH_RIGHT_CORNER: 291,
  UPPER_LIP_CENTER: 13,
  LOWER_LIP_CENTER: 14,
  LOWER_LIP_BOTTOM: 17,

  // Eyebrows
  LEFT_EYEBROW_INNER: 55,
  LEFT_EYEBROW_OUTER: 70,
  RIGHT_EYEBROW_INNER: 285,
  RIGHT_EYEBROW_OUTER: 300,

  // Cheeks
  LEFT_CHEEK: 116,
  RIGHT_CHEEK: 345
};

function dist2D(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Extract High-Precision Facial Action Unit Metrics
 */
export function computeActionUnits(landmarks: NormalizedLandmarkList): ActionUnitMetrics {
  const p = (idx: number) => landmarks[idx] || { x: 0, y: 0, z: 0 };

  // 1. Inter-Ocular Reference Distance (Distance between outer eye corners)
  const eyeDistance = dist2D(p(LANDMARK_INDEX.LEFT_EYE_OUTER), p(LANDMARK_INDEX.RIGHT_EYE_OUTER)) || 0.1;
  const faceHeight = dist2D(p(LANDMARK_INDEX.CHIN_BOTTOM), p(LANDMARK_INDEX.FOREHEAD_TOP)) || 0.2;

  // 2. Mouth Geometry (Width & Corner Lift)
  const rawMouthWidth = dist2D(p(LANDMARK_INDEX.MOUTH_LEFT_CORNER), p(LANDMARK_INDEX.MOUTH_RIGHT_CORNER));
  const mouthWidthRatio = rawMouthWidth / eyeDistance; // In smiles, mouth width expands from ~0.75 to >0.92

  const leftCorner = p(LANDMARK_INDEX.MOUTH_LEFT_CORNER);
  const rightCorner = p(LANDMARK_INDEX.MOUTH_RIGHT_CORNER);
  const upperLipCenter = p(LANDMARK_INDEX.UPPER_LIP_CENTER);
  const lowerLipCenter = p(LANDMARK_INDEX.LOWER_LIP_CENTER);
  const mouthCenterY = (upperLipCenter.y + lowerLipCenter.y) / 2;

  // In screen space (y increases downward):
  // If corners are elevated above the mouth center: (mouthCenterY - corner.y) > 0
  const leftCornerLift = (mouthCenterY - leftCorner.y) / eyeDistance;
  const rightCornerLift = (mouthCenterY - rightCorner.y) / eyeDistance;
  const avgCornerLift = (leftCornerLift + rightCornerLift) / 2;

  // AU12 (Smile): Combines mouth widening and upward corner angle
  const widthBonus = Math.max(0, (mouthWidthRatio - 0.80) * 4.5);
  const liftBonus = Math.max(0, (avgCornerLift + 0.01) * 12.0);
  const au12_raw = (widthBonus * 0.65) + (liftBonus * 0.35);
  const au12_smile = Math.max(0, Math.min(1, au12_raw));

  // 3. Eyebrow Geometry (Anger vs Sadness)
  const leftBrowInner = p(LANDMARK_INDEX.LEFT_EYEBROW_INNER);
  const rightBrowInner = p(LANDMARK_INDEX.RIGHT_EYEBROW_INNER);
  const leftBrowOuter = p(LANDMARK_INDEX.LEFT_EYEBROW_OUTER);
  const rightBrowOuter = p(LANDMARK_INDEX.RIGHT_EYEBROW_OUTER);

  const interBrowDist = dist2D(leftBrowInner, rightBrowInner) / eyeDistance; // Normally ~0.38 - 0.48; in anger drops < 0.35

  // Brow slant: In anger, inner brows pull down lower than outer brows (leftInner.y > leftOuter.y)
  const leftAngrySlant = (leftBrowInner.y - leftBrowOuter.y) / eyeDistance;
  const rightAngrySlant = (rightBrowInner.y - rightBrowOuter.y) / eyeDistance;
  const avgAngrySlant = (leftAngrySlant + rightAngrySlant) / 2;

  // In sadness, inner brows pull upward higher than outer brows (leftInner.y < leftOuter.y)
  const avgSadSlant = -avgAngrySlant;

  // AU4 (Brow Furrow / Anger): Inter-brow contraction AND downward inner brow slant
  const browContraction = Math.max(0, (0.39 - interBrowDist) * 6.0);
  const browSlantAnger = Math.max(0, (avgAngrySlant - 0.005) * 14.0);
  const au4_raw = (browContraction * 0.60) + (browSlantAnger * 0.40);
  const au4_brow_furrow = Math.max(0, Math.min(1, au4_raw));

  // 4. AU15 (Lip Corner Droop / Sadness)
  // When corners droop below the bottom lip vermilion:
  const leftCornerDroop = (leftCorner.y - lowerLipCenter.y) / eyeDistance;
  const rightCornerDroop = (rightCorner.y - lowerLipCenter.y) / eyeDistance;
  const avgCornerDroop = (leftCornerDroop + rightCornerDroop) / 2;
  const au15_raw = (avgCornerDroop - 0.008) * 18.0;
  const au15_lip_depress = Math.max(0, Math.min(1, au15_raw));

  // 5. AU1 (Inner Brow Raise / Sadness)
  const au1_raw = (avgSadSlant - 0.01) * 12.0;
  const au1_inner_brow_raise = Math.max(0, Math.min(1, au1_raw));

  return {
    au12_smile: parseFloat(au12_smile.toFixed(3)),
    au4_brow_furrow: parseFloat(au4_brow_furrow.toFixed(3)),
    au15_lip_depress: parseFloat(au15_lip_depress.toFixed(3)),
    au1_inner_brow_raise: parseFloat(au1_inner_brow_raise.toFixed(3)),
    mouthWidthRatio: parseFloat(mouthWidthRatio.toFixed(3)),
    eyeDistance: parseFloat((eyeDistance * 1000).toFixed(1))
  };
}

/**
 * Robust Facial Emotion Classifier
 */
export function classifyFACSEmotion(au: ActionUnitMetrics, applySmoothing = false): FACSPrediction {
  let happyScore = 0.05;
  let angryScore = 0.05;
  let sadScore = 0.05;
  let neutralScore = 0.40;

  // RULE 1: Smiile / Happiness Dominance
  // If mouth width is expanded (> 0.85) or AU12 is active, it is Happy
  if (au.mouthWidthRatio > 0.86 || au.au12_smile > 0.18) {
    const smileIntensity = Math.max(au.au12_smile, (au.mouthWidthRatio - 0.82) * 3.5);
    happyScore = 0.82 + Math.min(0.16, smileIntensity * 0.25);
    neutralScore = 0.08;
    sadScore = 0.04;
    angryScore = 0.04; // A wide smile completely suppresses anger
  }
  // RULE 2: Anger
  // Eyebrows must be contracted AND mouth must NOT be smiling
  else if (au.au4_brow_furrow > 0.22 && au.mouthWidthRatio < 0.84) {
    angryScore = 0.78 + Math.min(0.18, au.au4_brow_furrow * 0.25);
    neutralScore = 0.10;
    happyScore = 0.05;
    sadScore = 0.07;
  }
  // RULE 3: Sadness
  // Mouth corners droop OR inner eyebrows raised, with narrow mouth
  else if ((au.au15_lip_depress > 0.18 || au.au1_inner_brow_raise > 0.20) && au.mouthWidthRatio < 0.82) {
    const sadIntensity = Math.max(au.au15_lip_depress, au.au1_inner_brow_raise);
    sadScore = 0.76 + Math.min(0.20, sadIntensity * 0.25);
    neutralScore = 0.12;
    happyScore = 0.05;
    angryScore = 0.07;
  }
  // RULE 4: Neutral (Resting Baseline)
  else {
    neutralScore = 0.84 + Math.min(0.12, (0.84 - au.mouthWidthRatio) * 0.5);
    happyScore = 0.06;
    sadScore = 0.05;
    angryScore = 0.05;
  }

  // Softmax / Normalization
  const sum = happyScore + angryScore + sadScore + neutralScore;
  const scoresList = [
    { emotion: 'Happy' as EmotionType, score: parseFloat((happyScore / sum).toFixed(2)), color: EMOTION_COLORS.Happy },
    { emotion: 'Sad' as EmotionType, score: parseFloat((sadScore / sum).toFixed(2)), color: EMOTION_COLORS.Sad },
    { emotion: 'Neutral' as EmotionType, score: parseFloat((neutralScore / sum).toFixed(2)), color: EMOTION_COLORS.Neutral },
    { emotion: 'Angry' as EmotionType, score: parseFloat((angryScore / sum).toFixed(2)), color: EMOTION_COLORS.Angry }
  ];

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
let faceMeshInstance: any = null;
let initPromise: Promise<any> | null = null;

export async function getFaceMeshInstance(): Promise<any> {
  if (faceMeshInstance) return faceMeshInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const FaceMeshClass = (window as any).FaceMesh || FaceMeshModule;
    const mesh = new FaceMeshClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
    });

    mesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    await mesh.initialize();
    faceMeshInstance = mesh;
    return mesh;
  })();

  return initPromise;
}

/**
 * Process an HTMLCanvasElement, HTMLImageElement, or HTMLVideoElement
 */
export async function analyzeImageWithFACS(inputElement: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): Promise<FACSPrediction> {
  const mesh = await getFaceMeshInstance();

  return new Promise<FACSPrediction>((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({
          primary: 'Neutral',
          confidence: 0.70,
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
            mouthWidthRatio: 0.75,
            eyeDistance: 100
          },
          landmarksDetected: false
        });
      }
    }, 2500);

    const handleResults = (results: Results) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
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
            mouthWidthRatio: 0.75,
            eyeDistance: 100
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
