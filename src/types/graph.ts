
export interface Node {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

export interface Link {
  source: string;
  target: string;
  label: string;
  color: string;
  style?: string;
  width?: number;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface PositionedNode extends Node {
  screenX: number;
  screenY: number;
  radius: number;
}
