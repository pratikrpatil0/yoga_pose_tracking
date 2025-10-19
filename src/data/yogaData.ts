import { YogaPose, YogaSession } from '../types';

export const yogaPoses: YogaPose[] = [
  {
    id: 'mountain-pose',
    name: 'Mountain Pose (Tadasana)',
    instructions: [
      'Stand tall with feet hip-width apart',
      'Keep your shoulders relaxed and arms at sides',
      'Engage your core and lift the crown of your head',
      'Breathe deeply and hold for 30-60 seconds'
    ],
    benefits: [
      'Improves posture',
      'Strengthens legs and core',
      'Increases body awareness',
      'Calms the mind'
    ],
    difficulty: 'beginner',
    targetMuscles: ['Core', 'Legs', 'Posture muscles'],
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-d2fa7e6ec180?w=400',
    duration: 60,
    metValue: 2.5,
  },
  {
    id: 'tree-pose',
    name: 'Tree Pose (Vrksasana)',
    instructions: [
      'Stand on one leg with the other foot placed on inner thigh',
      'Keep hands in prayer position at heart center',
      'Focus on a point ahead to maintain balance',
      'Hold for 30-60 seconds, then switch sides'
    ],
    benefits: [
      'Improves balance and stability',
      'Strengthens legs and core',
      'Increases concentration',
      'Opens hips'
    ],
    difficulty: 'beginner',
    targetMuscles: ['Core', 'Legs', 'Hips'],
    imageUrl: 'https://images.unsplash.com/photo-1573688574741-6635af8de27a?w=400',
    duration: 60,
    metValue: 3.0,
  },
  {
    id: 'downward-dog',
    name: 'Downward-Facing Dog (Adho Mukha Svanasana)',
    instructions: [
      'Start on hands and knees',
      'Tuck toes under and lift hips up and back',
      'Straighten legs and press hands into the ground',
      'Keep head between arms and breathe deeply'
    ],
    benefits: [
      'Stretches hamstrings and calves',
      'Strengthens arms and shoulders',
      'Improves circulation',
      'Energizes the body'
    ],
    difficulty: 'beginner',
    targetMuscles: ['Arms', 'Shoulders', 'Hamstrings', 'Calves'],
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    duration: 60,
    metValue: 3.5,
  },
  {
    id: 'warrior-1',
    name: 'Warrior I (Virabhadrasana I)',
    instructions: [
      'Step one foot forward into a lunge',
      'Turn back foot out at 45-degree angle',
      'Raise arms overhead with palms facing each other',
      'Keep front knee over ankle and hold'
    ],
    benefits: [
      'Strengthens legs and glutes',
      'Opens chest and shoulders',
      'Improves balance',
      'Builds confidence'
    ],
    difficulty: 'intermediate',
    targetMuscles: ['Legs', 'Glutes', 'Core', 'Shoulders'],
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-d2fa7e6ec180?w=400',
    duration: 60,
    metValue: 4.0,
  },
  {
    id: 'triangle-pose',
    name: 'Triangle Pose (Trikonasana)',
    instructions: [
      'Stand with feet wide apart',
      'Turn right foot out 90 degrees',
      'Reach right hand toward floor, left hand toward ceiling',
      'Keep both legs straight and hold'
    ],
    benefits: [
      'Stretches legs and spine',
      'Strengthens core',
      'Improves balance',
      'Opens chest and shoulders'
    ],
    difficulty: 'intermediate',
    targetMuscles: ['Legs', 'Core', 'Spine'],
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    duration: 60,
    metValue: 3.5,
  },
  {
    id: 'child-pose',
    name: 'Child\'s Pose (Balasana)',
    instructions: [
      'Kneel on the floor with big toes touching',
      'Sit back on your heels',
      'Fold forward with arms extended or at sides',
      'Rest forehead on the ground and breathe deeply'
    ],
    benefits: [
      'Relieves stress and anxiety',
      'Stretches hips and spine',
      'Calms the nervous system',
      'Helps with digestion'
    ],
    difficulty: 'beginner',
    targetMuscles: ['Hips', 'Spine'],
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-d2fa7e6ec180?w=400',
    duration: 60,
    metValue: 2.0,
  },
  {
    id: 'cobra-pose',
    name: 'Cobra Pose (Bhujangasana)',
    instructions: [
      'Lie face down with palms under shoulders',
      'Press palms down and lift chest off the ground',
      'Keep shoulders away from ears',
      'Look forward and breathe deeply'
    ],
    benefits: [
      'Strengthens spine and arms',
      'Opens chest and shoulders',
      'Improves posture',
      'Energizes the body'
    ],
    difficulty: 'beginner',
    targetMuscles: ['Back', 'Arms', 'Chest'],
    imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400',
    duration: 45,
    metValue: 3.0,
  },
  {
    id: 'plank-pose',
    name: 'Plank Pose (Phalakasana)',
    instructions: [
      'Start in push-up position',
      'Keep body in straight line from head to heels',
      'Engage core and hold strong',
      'Breathe steadily while holding'
    ],
    benefits: [
      'Strengthens core and arms',
      'Improves posture',
      'Builds endurance',
      'Tones entire body'
    ],
    difficulty: 'intermediate',
    targetMuscles: ['Core', 'Arms', 'Shoulders'],
    imageUrl: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400',
    duration: 30,
    metValue: 4.5,
  },
];

export const yogaSessions: YogaSession[] = [
  {
    id: 'morning-flow',
    name: 'Morning Energy Flow',
    description: 'A gentle sequence to wake up your body and mind',
    difficulty: 'beginner',
    duration: 15,
    poses: [yogaPoses[0], yogaPoses[2], yogaPoses[6], yogaPoses[5]], // Mountain, Downward Dog, Cobra, Child's
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-d2fa7e6ec180?w=600',
    category: 'Morning',
  },
  {
    id: 'strength-builder',
    name: 'Strength Builder',
    description: 'Build strength and stability with these powerful poses',
    difficulty: 'intermediate',
    duration: 25,
    poses: [yogaPoses[3], yogaPoses[7], yogaPoses[4], yogaPoses[1]], // Warrior I, Plank, Triangle, Tree
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
    category: 'Strength',
  },
  {
    id: 'relaxation-flow',
    name: 'Evening Relaxation',
    description: 'Unwind and prepare for restful sleep',
    difficulty: 'beginner',
    duration: 20,
    poses: [yogaPoses[5], yogaPoses[0], yogaPoses[6], yogaPoses[5]], // Child's, Mountain, Cobra, Child's
    imageUrl: 'https://images.unsplash.com/photo-1573688574741-6635af8de27a?w=600',
    category: 'Relaxation',
  },
  {
    id: 'balance-focus',
    name: 'Balance & Focus',
    description: 'Improve balance, concentration, and mindfulness',
    difficulty: 'intermediate',
    duration: 18,
    poses: [yogaPoses[1], yogaPoses[4], yogaPoses[3], yogaPoses[0]], // Tree, Triangle, Warrior I, Mountain
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600',
    category: 'Balance',
  },
  {
    id: 'quick-stretch',
    name: 'Quick Desk Break',
    description: 'Perfect for a quick stretch during work breaks',
    difficulty: 'beginner',
    duration: 10,
    poses: [yogaPoses[0], yogaPoses[6], yogaPoses[5]], // Mountain, Cobra, Child's
    imageUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600',
    category: 'Quick',
  },
];