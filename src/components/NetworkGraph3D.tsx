
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

    // Function to split text into lines
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
      const maxLineWidth = 130; // Maximum width for text within circle
      const lines = splitTextIntoLines(text, maxLineWidth);
      const lineHeight = 16;
      const padding = 30;
      
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
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Dynamically adjust scale and spacing based on canvas size
      const baseScale = Math.min(rect.width, rect.height) / 10;
      const scale = Math.max(baseScale, 80);
      const nodeSpacing = scale * 1.8; // Increased spacing between nodes

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Check if we have a shortcut link (generated result)
      const hasShortcut = data.links.some(link => link.width && link.width > 2);

      // Calculate node positions with better spacing
      const nodesWithPositions = data.nodes.map((node, index) => {
        const radius = calculateNodeRadius(node.label);
        let screenX, screenY;

        if (hasShortcut) {
          // When shortcut is generated, arrange nodes in a triangle with more space
          if (index === 0) { // Class A - left
            screenX = centerX - nodeSpacing;
            screenY = centerY;
          } else if (index === 1) { // Class B - top center
            screenX = centerX;
            screenY = centerY - nodeSpacing * 0.8;
          } else { // Class C - right
            screenX = centerX + nodeSpacing;
            screenY = centerY;
          }
        } else {
          // Normal horizontal layout with increased spacing
          screenX = centerX + (node.x * nodeSpacing);
          screenY = centerY + (node.y * nodeSpacing * 0.3); // Slight vertical offset
        }
        
        return {
          ...node,
          screenX,
          screenY,
          z: node.z,
          radius: radius
        };
      });

      // Draw links with better label positioning
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
          const controlY = midY - 60; // Curve upward
          
          ctx.moveTo(startEdgeX, startEdgeY);
          ctx.quadraticCurveTo(midX, controlY, endEdgeX, endEdgeY);
        } else {
          ctx.moveTo(startEdgeX, startEdgeY);
          ctx.lineTo(endEdgeX, endEdgeY);
        }
        
        ctx.strokeStyle = link.color;
        ctx.lineWidth = link.width || 2;
        
        if (link.style === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.stroke();

        // Position link labels to avoid intersections
        let labelX, labelY;
        
        if (isShortcut) {
          // Position shortcut label above the curved line
          labelX = (startEdgeX + endEdgeX) / 2;
          labelY = ((startEdgeY + endEdgeY) / 2) - 70;
        } else {
          // Position regular labels with offset to avoid circles
          const midX = (startEdgeX + endEdgeX) / 2;
          const midY = (startEdgeY + endEdgeY) / 2;
          
          // Calculate perpendicular offset to move label away from line
          const perpAngle = angle + Math.PI / 2;
          const offsetDistance = 25;
          
          labelX = midX + Math.cos(perpAngle) * offsetDistance;
          labelY = midY + Math.sin(perpAngle) * offsetDistance;
        }
        
        // Draw link label with enhanced background
        ctx.font = '12px Inter, sans-serif';
        const textMetrics = ctx.measureText(link.label);
        const textWidth = textMetrics.width;
        const textHeight = 16;
        
        // Draw text background with padding
        const bgPadding = 8;
        ctx.fillStyle = isShortcut ? 'rgba(59, 130, 246, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          labelX - textWidth/2 - bgPadding, 
          labelY - textHeight/2 - bgPadding/2, 
          textWidth + bgPadding * 2, 
          textHeight + bgPadding
        );
        
        // Draw text border
        ctx.strokeStyle = isShortcut ? '#3b82f6' : '#e5e7eb';
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
        ctx.lineWidth = 4;
        ctx.stroke();

        // Add subtle inner shadow
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius - 4, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw multi-line node label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const maxLineWidth = radius * 1.7;
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
