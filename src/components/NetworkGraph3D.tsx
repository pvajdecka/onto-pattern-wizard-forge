
import React, { useRef, useEffect } from 'react';

interface Node {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

interface Link {
  source: string;
  target: string;
  label: string;
  color: string;
  style?: string;
  width?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface NetworkGraph3DProps {
  data: GraphData;
}

export const NetworkGraph3D: React.FC<NetworkGraph3DProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Function to split text into lines for circles
    const splitTextIntoLines = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      ctx.font = 'bold 12px Inter, sans-serif';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, split it
            lines.push(word);
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // Function to calculate optimal node radius based on text lines
    const calculateNodeRadius = (text: string) => {
      const maxLineWidth = 100;
      const lines = splitTextIntoLines(text, maxLineWidth);
      const lineHeight = 16;
      const padding = 20;
      
      // Calculate radius based on text dimensions
      const textHeight = lines.length * lineHeight;
      const maxTextWidth = Math.max(...lines.map(line => {
        ctx.font = 'bold 12px Inter, sans-serif';
        return ctx.measureText(line).width;
      }));
      
      const radiusForWidth = (maxTextWidth / 2) + padding;
      const radiusForHeight = (textHeight / 2) + padding;
      
      return Math.max(radiusForWidth, radiusForHeight, 45);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Add margins to ensure complete graph fits
      const margin = 100;
      const usableWidth = rect.width - (margin * 2);
      const usableHeight = rect.height - (margin * 2);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Check if we have a shortcut link (generated result)
      const hasShortcut = data.links.some(link => link.width && link.width > 2);

      // Calculate maximum node radius to adjust spacing
      const maxRadius = Math.max(...data.nodes.map(node => calculateNodeRadius(node.label)));
      
      // Dynamic spacing based on container size and max radius
      const baseSpacing = Math.min(usableWidth, usableHeight) / 3.5;
      const nodeSpacing = Math.max(baseSpacing, maxRadius * 3);

      // Calculate node positions with safe bounds
      const nodesWithPositions = data.nodes.map((node, index) => {
        const radius = calculateNodeRadius(node.label);
        let screenX, screenY;

        if (hasShortcut) {
          // Triangle layout for shortcut pattern
          if (index === 0) { // Class A - left
            screenX = centerX - nodeSpacing * 0.8;
            screenY = centerY;
          } else if (index === 1) { // Class B - top center
            screenX = centerX;
            screenY = centerY - nodeSpacing * 0.7;
          } else if (index === 2) { // Class C - right
            screenX = centerX + nodeSpacing * 0.8;
            screenY = centerY;
          } else { // New class - bottom
            screenX = centerX;
            screenY = centerY + nodeSpacing * 0.9;
          }
        } else {
          // Horizontal layout for normal pattern
          const totalNodes = data.nodes.length;
          const startX = centerX - ((totalNodes - 1) * nodeSpacing) / 2;
          screenX = startX + (index * nodeSpacing);
          screenY = centerY + (node.y * nodeSpacing * 0.1);
        }
        
        // Ensure nodes stay within bounds
        screenX = Math.max(margin + radius, Math.min(rect.width - margin - radius, screenX));
        screenY = Math.max(margin + radius, Math.min(rect.height - margin - radius, screenY));
        
        return {
          ...node,
          screenX,
          screenY,
          z: node.z,
          radius: radius
        };
      });

      // Draw links with improved positioning to avoid intersections
      data.links.forEach(link => {
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
          labelX = Math.max(margin + 60, Math.min(rect.width - margin - 60, labelX));
          labelY = Math.max(margin + 30, Math.min(rect.height - margin - 30, labelY));
          
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

      // Draw nodes with multi-line text
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
        const lines = splitTextIntoLines(node.label, maxLineWidth);
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

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}
    />
  );
};
