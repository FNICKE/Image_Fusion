export const boundingBoxes = [
  { id: 1, x: 150, y: 200, w: 180, h: 120, label: "Damaged Building", severity: "high" },
  { id: 2, x: 400, y: 150, w: 140, h: 100, label: "Debris Field", severity: "medium" },
  { id: 3, x: 600, y: 350, w: 200, h: 160, label: "Flooding", severity: "high" },
  { id: 4, x: 50, y: 450, w: 120, h: 80, label: "Road Blockage", severity: "low" },
  { id: 5, x: 750, y: 100, w: 160, h: 140, label: "Collapsed Structure", severity: "critical" }
];

export const mapMarkers = [
  { id: 1, lat: 40.7128, lng: -74.0060, title: "Damaged Building", severity: "high" },
  { id: 2, lat: 40.7589, lng: -73.9851, title: "Debris Field", severity: "medium" },
  { id: 3, lat: 40.7282, lng: -73.7949, title: "Flooding Area", severity: "high" },
  { id: 4, lat: 40.6892, lng: -74.0445, title: "Road Blockage", severity: "low" },
  { id: 5, lat: 40.7505, lng: -73.9934, title: "Collapsed Structure", severity: "critical" }
];

export const severityColors = {
  low: "#10B981",
  medium: "#F59E0B", 
  high: "#EF4444",
  critical: "#DC2626"
};