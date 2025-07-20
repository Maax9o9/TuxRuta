export interface RoutePoint {
  lat: number;
  lng: number;
  order: number;
  description?: string;
}

export interface RoutePath {
  id: string;
  name: string;
  description?: string;
  points: RoutePoint[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  estimatedDuration?: number; 
  estimatedDistance?: number; 
}

export interface RoutePathCreateRequest {
  name: string;
  description?: string;
  points: RoutePoint[];
}

export interface RoutePathUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  points?: RoutePoint[];
  isActive?: boolean;
}
