import { SensorData, Crop, IrrigationZone, TeamMember, Alert, HistoricalData } from '../types';

// Generate random data points for historical data
const generateHistoricalData = (days: number, baseValue: number, variance: number): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a value with some random variance
    const randomVariance = (Math.random() * 2 - 1) * variance;
    const value = baseValue + randomVariance;
    
    data.push({
      timestamp: date,
      value: Number(value.toFixed(1))
    });
  }
  
  return data;
};

// Sensor data
export const sensorData: SensorData[] = [
  {
    id: 'temp-1',
    type: 'temperature',
    value: 24.5,
    unit: '°C',
    timestamp: new Date(),
    location: 'Greenhouse 1',
    status: 'normal'
  },
  {
    id: 'hum-1',
    type: 'humidity',
    value: 68,
    unit: '%',
    timestamp: new Date(),
    location: 'Greenhouse 1',
    status: 'normal'
  },
  {
    id: 'daz-1',
    type: 'daz',
    value: 450,
    unit: 'ppm',
    timestamp: new Date(),
    location: 'Greenhouse 1',
    status: 'warning'
  },
  {
    id: 'soil-1',
    type: 'soil',
    value: 32,
    unit: '%',
    timestamp: new Date(),
    location: 'Zone A',
    status: 'critical'
  },
  {
    id: 'temp-2',
    type: 'temperature',
    value: 22.8,
    unit: '°C',
    timestamp: new Date(),
    location: 'Greenhouse 2',
    status: 'normal'
  },
  {
    id: 'hum-2',
    type: 'humidity',
    value: 72,
    unit: '%',
    timestamp: new Date(),
    location: 'Greenhouse 2',
    status: 'warning'
  }
];

// Historical data for each sensor
export const temperatureHistory = generateHistoricalData(30, 24, 3);
export const humidityHistory = generateHistoricalData(30, 70, 10);
export const dazHistory = generateHistoricalData(30, 400, 100);
export const soilHistory = generateHistoricalData(30, 35, 15);

// Crops data
export const crops: Crop[] = [
  {
    id: 'crop-1',
    name: 'Tomatoes',
    type: 'Vegetable',
    plantedDate: new Date(2023, 2, 15),
    growthStage: 'Fruiting',
    lastIrrigation: new Date(2023, 5, 10, 8, 30),
    nextScheduledIrrigation: new Date(2023, 5, 12, 8, 30),
    healthStatus: 'healthy',
    location: 'Zone A',
    imageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg'
  },
  {
    id: 'crop-2',
    name: 'Lettuce',
    type: 'Leafy Green',
    plantedDate: new Date(2023, 3, 1),
    growthStage: 'Mature',
    lastIrrigation: new Date(2023, 5, 10, 9, 0),
    nextScheduledIrrigation: new Date(2023, 5, 11, 9, 0),
    healthStatus: 'at-risk',
    location: 'Zone B',
    imageUrl: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg'
  },
  {
    id: 'crop-3',
    name: 'Strawberries',
    type: 'Berry',
    plantedDate: new Date(2023, 1, 10),
    growthStage: 'Flowering',
    lastIrrigation: new Date(2023, 5, 10, 7, 45),
    nextScheduledIrrigation: new Date(2023, 5, 12, 7, 45),
    healthStatus: 'healthy',
    location: 'Zone C',
    imageUrl: 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg'
  },
  {
    id: 'crop-4',
    name: 'Peppers',
    type: 'Vegetable',
    plantedDate: new Date(2023, 2, 20),
    growthStage: 'Fruiting',
    lastIrrigation: new Date(2023, 5, 10, 8, 15),
    nextScheduledIrrigation: new Date(2023, 5, 12, 8, 15),
    healthStatus: 'diseased',
    location: 'Zone A',
    imageUrl: 'https://images.pexels.com/photos/128536/pexels-photo-128536.jpeg'
  }
];

// Irrigation zones
export const irrigationZones: IrrigationZone[] = [
  {
    id: 'zone-a',
    name: 'Zone A',
    status: 'active',
    lastActivated: new Date(2023, 5, 10, 8, 30),
    nextScheduled: new Date(2023, 5, 12, 8, 30),
    duration: 15,
    cropIds: ['crop-1', 'crop-4'],
    automationEnabled: true,
    moistureThreshold: 30
  },
  {
    id: 'zone-b',
    name: 'Zone B',
    status: 'scheduled',
    lastActivated: new Date(2023, 5, 10, 9, 0),
    nextScheduled: new Date(2023, 5, 11, 9, 0),
    duration: 10,
    cropIds: ['crop-2'],
    automationEnabled: true,
    moistureThreshold: 25
  },
  {
    id: 'zone-c',
    name: 'Zone C',
    status: 'inactive',
    lastActivated: new Date(2023, 5, 10, 7, 45),
    nextScheduled: new Date(2023, 5, 12, 7, 45),
    duration: 20,
    cropIds: ['crop-3'],
    automationEnabled: false,
    moistureThreshold: 35
  }
];

// Team members
export const teamMember55s: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Alex Johnson',
    role: 'Agricultural Scientist',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    status: 'online',
    bio: 'Specializes in crop diseases and prevention strategies with over 10 years of experience.',
    lastActive: new Date()
  },
  {
    id: 'team-2',
    name: 'Sam Williams',
    role: 'Irrigation Engineer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    status: 'away',
    bio: 'Designs efficient irrigation systems for optimal water usage and crop health.',
    lastActive: new Date(new Date().setHours(new Date().getHours() - 2))
  },
  {
    id: 'team-3',
    name: 'Taylor Chen',
    role: 'Data Analyst',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    status: 'online',
    bio: 'Analyzes sensor data to provide insights for improving crop yields and resource efficiency.',
    lastActive: new Date()
  },
  {
    id: 'team-4',
    name: 'Jordan Smith',
    role: 'System Administrator',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    status: 'offline',
    bio: 'Maintains the technical infrastructure ensuring all sensors and systems run smoothly.',
    lastActive: new Date(new Date().setDate(new Date().getDate() - 1))
  }
];

// Alerts
export const alerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'Low Soil Moisture',
    message: 'Zone A soil moisture below critical threshold (30%). Automated irrigation initiated.',
    type: 'warning',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
    isRead: false,
    relatedEntityId: 'zone-a',
    relatedEntityType: 'irrigation'
  },
  {
    id: 'alert-2',
    title: 'High Humidity Detected',
    message: 'Greenhouse 2 humidity at 72%, exceeding optimal range. Check ventilation.',
    type: 'warning',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 4)),
    isRead: true,
    relatedEntityId: 'hum-2',
    relatedEntityType: 'sensor'
  },
  {
    id: 'alert-3',
    title: 'Potential Disease Detected',
    message: 'AI analysis indicates potential fungal infection in Peppers crop. Inspection recommended.',
    type: 'error',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    isRead: false,
    relatedEntityId: 'crop-4',
    relatedEntityType: 'crop'
  },
  {
    id: 'alert-4',
    title: 'Irrigation Complete',
    message: 'Zone B irrigation cycle completed successfully.',
    type: 'success',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    isRead: true,
    relatedEntityId: 'zone-b',
    relatedEntityType: 'irrigation'
  }
];

// This would be in ../utils/mockData.ts (not modified here due to constraints)
export const teamMembers = [
  {
    id: '1',
    name: 'Ikram Benfellah',
    role: 'Student',
    bio: 'Passionate about smart agriculture and technology.', // Default bio
    avatar: '/images/photo1.png',
    status: 'online', // Default status
    lastActive: new Date().toISOString(), // Default recent activity
  },
  {
    id: '2',
    name: 'Fatima Zahra Fadel',
    role: 'Student',
    bio: 'Passionate about smart agriculture and technology.',
    avatar: '/images/photo2.png',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mostapha Id bella',
    role: 'Student',
    bio: 'Passionate about smart agriculture and technology.',
    avatar: '/images/photo3.png',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Anwar meliari',
    role: 'Student',
    bio: 'Passionate about smart agriculture and technology.',
    avatar: '/images/photo4.png',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Zahra maddah',
    role: 'Student',
    bio: 'Passionate about smart agriculture and technology.',
    avatar: '/images/photo5.png',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Ziad chi l3ayba',
    role: 'Student',
    bio: 'Passionate about smart agriculture and technology.',
    avatar: '/images/photo6.png',
    status: 'online',
    lastActive: new Date().toISOString(),
  },
];