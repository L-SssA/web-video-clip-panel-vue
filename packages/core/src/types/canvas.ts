export type PathCommand =
  | { type: "beginPath"; args: [] }
  | { type: "moveTo"; args: [number, number] }
  | { type: "lineTo"; args: [number, number] }
  | { type: "arc"; args: [number, number, number, number, number, boolean?] }
  | { type: "arcTo"; args: [number, number, number, number, number] }
  | { type: "quadraticCurveTo"; args: [number, number, number, number] }
  | { type: "bezierCurveTo"; args: [number, number, number, number, number, number] }
  | { type: "rect"; args: [number, number, number, number] }
  | { type: "ellipse"; args: [number, number, number, number, number, number, number, boolean?] }
  | { type: "closePath"; args: [] };

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
