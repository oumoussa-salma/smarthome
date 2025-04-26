export interface SensorData {
  id: string;
  type: 'temperature' | 'humidity' | 'daz' | 'soil';
  value: number;
  unit: string;
  timestamp: Date;
  location: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface HistoricalData {
  timestamp: Date;
  value: number;
}

export interface Crop {
  id: string;
  name: string;
  type: string;
  plantedDate: Date;
  growthStage: string;
  lastIrrigation: Date;
  nextScheduledIrrigation: Date | null;
  healthStatus: 'healthy' | 'at-risk' | 'diseased';
  location: string;
  imageUrl: string;
}

export interface IrrigationZone {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'scheduled';
  lastActivated: Date | null;
  nextScheduled: Date | null;
  duration: number; // in minutes
  cropIds: string[];
  automationEnabled: boolean;
  moistureThreshold: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  bio: string;
  lastActive: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'crop' | 'irrigation' | 'sensor';
}