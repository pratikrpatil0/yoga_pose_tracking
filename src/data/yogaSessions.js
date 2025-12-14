export const yogaSessions = [
  {
    id: 'beginner-1',
    name: 'Beginner Morning Flow',
    description: 'A gentle introduction to yoga with basic poses',
    poses: [
      {
        name: 'Mountain Pose',
        duration: 20,
        instruction: 'Stand straight with feet together, arms at sides, shoulders back',
        targetKeypoints: {
          leftShoulder: { x: 0.4, y: 0.3 },
          rightShoulder: { x: 0.6, y: 0.3 },
          leftHip: { x: 0.4, y: 0.6 },
          rightHip: { x: 0.6, y: 0.6 },
        },
      },
      {
        name: 'Tree Pose',
        duration: 20,
        instruction: 'Balance on one leg, place other foot on inner thigh',
        targetKeypoints: {
          leftShoulder: { x: 0.45, y: 0.3 },
          rightShoulder: { x: 0.55, y: 0.3 },
          leftKnee: { x: 0.35, y: 0.55 },
          rightKnee: { x: 0.55, y: 0.7 },
        },
      },
      {
        name: 'Warrior Pose',
        duration: 20,
        instruction: 'Step back, bend front knee, extend arms to sides',
        targetKeypoints: {
          leftShoulder: { x: 0.3, y: 0.35 },
          rightShoulder: { x: 0.7, y: 0.35 },
          leftHip: { x: 0.35, y: 0.6 },
          rightHip: { x: 0.65, y: 0.6 },
        },
      },
    ],
  },
  {
    id: 'intermediate-1',
    name: 'Strength Builder',
    description: 'Build core strength with challenging poses',
    poses: [
      {
        name: 'Downward Dog',
        duration: 25,
        instruction: 'Form inverted V shape, hips high, hands and feet on ground',
        targetKeypoints: {
          leftShoulder: { x: 0.35, y: 0.4 },
          rightShoulder: { x: 0.65, y: 0.4 },
          leftHip: { x: 0.4, y: 0.3 },
          rightHip: { x: 0.6, y: 0.3 },
        },
      },
      {
        name: 'Plank Pose',
        duration: 25,
        instruction: 'Hold body straight from head to heels, arms extended',
        targetKeypoints: {
          leftShoulder: { x: 0.4, y: 0.4 },
          rightShoulder: { x: 0.6, y: 0.4 },
          leftHip: { x: 0.4, y: 0.5 },
          rightHip: { x: 0.6, y: 0.5 },
        },
      },
    ],
  },
  {
    id: 'flexibility-1',
    name: 'Flexibility Focus',
    description: 'Improve flexibility with stretching poses',
    poses: [
      {
        name: 'Forward Bend',
        duration: 25,
        instruction: 'Fold forward from hips, let hands hang toward floor',
        targetKeypoints: {
          leftShoulder: { x: 0.45, y: 0.5 },
          rightShoulder: { x: 0.55, y: 0.5 },
          leftHip: { x: 0.45, y: 0.45 },
          rightHip: { x: 0.55, y: 0.45 },
        },
      },
      {
        name: 'Cobra Pose',
        duration: 25,
        instruction: 'Lie down, push up with arms, arch back upward',
        targetKeypoints: {
          leftShoulder: { x: 0.4, y: 0.4 },
          rightShoulder: { x: 0.6, y: 0.4 },
          leftHip: { x: 0.45, y: 0.6 },
          rightHip: { x: 0.55, y: 0.6 },
        },
      },
      {
        name: 'Child Pose',
        duration: 25,
        instruction: 'Kneel, sit back on heels, stretch arms forward',
        targetKeypoints: {
          leftShoulder: { x: 0.4, y: 0.5 },
          rightShoulder: { x: 0.6, y: 0.5 },
          leftHip: { x: 0.45, y: 0.4 },
          rightHip: { x: 0.55, y: 0.4 },
        },
      },
    ],
  },
];
