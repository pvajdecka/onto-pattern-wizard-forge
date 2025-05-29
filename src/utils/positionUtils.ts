
import type { Node, PositionedNode } from '@/types/graph';
import { calculateNodeRadius } from './textUtils';

export const calculateNodePositions = (
  nodes: Node[],
  hasShortcut: boolean,
  centerX: number,
  centerY: number,
  nodeSpacing: number,
  margin: number,
  rectWidth: number,
  rectHeight: number,
  ctx: CanvasRenderingContext2D
): PositionedNode[] => {
  return nodes.map((node, index) => {
    const radius = calculateNodeRadius(node.label, ctx);
    let screenX, screenY;

    if (hasShortcut) {
      // Modified triangle layout for shortcut pattern
      if (index === 0) { // Class A - positioned around Class B (top-left)
        screenX = centerX - nodeSpacing * 0.6;
        screenY = centerY - nodeSpacing * 0.5;
      } else if (index === 1) { // Class B - center
        screenX = centerX;
        screenY = centerY;
      } else if (index === 2) { // Class C - bottom
        screenX = centerX;
        screenY = centerY + nodeSpacing * 0.8;
      } else { // New class - left
        screenX = centerX - nodeSpacing * 1.2;
        screenY = centerY;
      }
    } else {
      // Horizontal layout for normal pattern
      const totalNodes = nodes.length;
      const startX = centerX - ((totalNodes - 1) * nodeSpacing) / 2;
      screenX = startX + (index * nodeSpacing);
      screenY = centerY + (node.y * nodeSpacing * 0.1);
    }
    
    // Ensure nodes stay within bounds
    screenX = Math.max(margin + radius, Math.min(rectWidth - margin - radius, screenX));
    screenY = Math.max(margin + radius, Math.min(rectHeight - margin - radius, screenY));
    
    return {
      ...node,
      screenX,
      screenY,
      z: node.z,
      radius: radius
    };
  });
};
