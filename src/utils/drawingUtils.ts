
import type { Link, PositionedNode } from '@/types/graph';
import { splitTextIntoLines } from './textUtils';

export const drawLinks = (
  ctx: CanvasRenderingContext2D,
  links: Link[],
  nodesWithPositions: PositionedNode[],
  margin: number,
  rectWidth: number,
  rectHeight: number
) => {
  links.forEach(link => {
    const sourceNode = nodesWithPositions.find(n => n.id === link.source);
    const targetNode = nodesWithPositions.find(n => n.id === link.target);
    
    if (!sourceNode || !targetNode) return;

    const startX = sourceNode.screenX;
    const startY = sourceNode.screenY;
    const endX = targetNode.screenX;
    const endY = targetNode.screenY;

    // Calculate edge points on circle boundaries
    const angle = Math.atan2(endY - startY, endX - startX);
    const startEdgeX = startX + Math.cos(angle) * sourceNode.radius;
    const startEdgeY = startY + Math.sin(angle) * sourceNode.radius;
    const endEdgeX = endX - Math.cos(angle) * targetNode.radius;
    const endEdgeY = endY - Math.sin(angle) * targetNode.radius;

    // Determine if this is a shortcut link
    const isShortcut = link.width && link.width > 2;

    // Draw link
    ctx.beginPath();
    if (isShortcut) {
      // Draw curved shortcut link
      const midX = (startEdgeX + endEdgeX) / 2;
      const midY = (startEdgeY + endEdgeY) / 2;
      const controlY = midY - 100; // Curve upward more
      
      ctx.moveTo(startEdgeX, startEdgeY);
      ctx.quadraticCurveTo(midX, controlY, endEdgeX, endEdgeY);
    } else {
      ctx.moveTo(startEdgeX, startEdgeY);
      ctx.lineTo(endEdgeX, endEdgeY);
    }
    
    ctx.strokeStyle = link.color;
    ctx.lineWidth = link.width || 2;
    
    if (link.style === 'dashed') {
      ctx.setLineDash([8, 8]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.stroke();

    // Calculate label position to avoid all intersections
    let labelX, labelY;
    
    if (isShortcut) {
      // Position shortcut label above the curved line with more clearance
      labelX = (startEdgeX + endEdgeX) / 2;
      labelY = ((startEdgeY + endEdgeY) / 2) - 120;
    } else {
      // Position regular labels with smart offset calculation
      const midX = (startEdgeX + endEdgeX) / 2;
      const midY = (startEdgeY + endEdgeY) / 2;
      
      // Calculate perpendicular offset based on line direction
      const perpAngle = angle + Math.PI / 2;
      let offsetDistance = 60; // Increased distance to avoid circles
      
      // Check if we need to place label above or below the line
      // For horizontal lines, place labels above by default
      if (Math.abs(startY - endY) < 20) {
        labelY = midY - offsetDistance;
        labelX = midX;
      } else {
        // For angled lines, use perpendicular offset
        labelX = midX + Math.cos(perpAngle) * offsetDistance;
        labelY = midY + Math.sin(perpAngle) * offsetDistance;
      }
      
      // Ensure label stays within bounds and doesn't intersect nodes
      labelX = Math.max(margin + 60, Math.min(rectWidth - margin - 60, labelX));
      labelY = Math.max(margin + 30, Math.min(rectHeight - margin - 30, labelY));
      
      // Additional check to avoid node intersections
      for (const node of nodesWithPositions) {
        const distToNode = Math.sqrt(Math.pow(labelX - node.screenX, 2) + Math.pow(labelY - node.screenY, 2));
        if (distToNode < node.radius + 40) {
          // Move label further away
          const nodeAngle = Math.atan2(labelY - node.screenY, labelX - node.screenX);
          labelX = node.screenX + Math.cos(nodeAngle) * (node.radius + 50);
          labelY = node.screenY + Math.sin(nodeAngle) * (node.radius + 50);
        }
      }
    }
    
    // Draw link label with enhanced background
    ctx.font = 'bold 11px Inter, sans-serif';
    const textMetrics = ctx.measureText(link.label);
    const textWidth = textMetrics.width;
    const textHeight = 16;
    
    // Draw text background with padding
    const bgPadding = 8;
    ctx.fillStyle = isShortcut ? 'rgba(59, 130, 246, 0.95)' : 'rgba(255, 255, 255, 0.98)';
    ctx.fillRect(
      labelX - textWidth/2 - bgPadding, 
      labelY - textHeight/2 - bgPadding/2, 
      textWidth + bgPadding * 2, 
      textHeight + bgPadding
    );
    
    // Draw text border
    ctx.strokeStyle = isShortcut ? '#3b82f6' : '#d1d5db';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(
      labelX - textWidth/2 - bgPadding, 
      labelY - textHeight/2 - bgPadding/2, 
      textWidth + bgPadding * 2, 
      textHeight + bgPadding
    );
    
    // Draw text
    ctx.fillStyle = isShortcut ? '#ffffff' : '#374151';
    ctx.textAlign = 'center';
    ctx.fillText(link.label, labelX, labelY + 4);
  });
};

export const drawNodes = (ctx: CanvasRenderingContext2D, nodesWithPositions: PositionedNode[]) => {
  nodesWithPositions.forEach(node => {
    const screenX = node.screenX;
    const screenY = node.screenY;
    const radius = node.radius;

    // Draw node circle with enhanced gradient
    const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
    gradient.addColorStop(0, node.color);
    gradient.addColorStop(0.7, node.color);
    gradient.addColorStop(1, node.color + 'CC');
    
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Add subtle inner shadow
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius - 3, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw multi-line node label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    const maxLineWidth = radius * 1.6;
    const lines = splitTextIntoLines(node.label, maxLineWidth, ctx);
    const lineHeight = 16;
    const totalTextHeight = lines.length * lineHeight;
    const startY = screenY - (totalTextHeight / 2) + (lineHeight / 2);
    
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, screenX, y);
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  });
};
