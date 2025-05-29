
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

      ctx.font = 'bold 11px Inter, sans-serif';
      
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
      const maxLineWidth = 120; // Maximum width for text within circle
      const lines = splitTextIntoLines(text, maxLineWidth);
      const lineHeight = 14;
      const padding = 25;
      
      // Calculate radius based on text dimensions
      const textHeight = lines.length * lineHeight;
      const maxTextWidth = Math.max(...lines.map(line => {
        ctx.font = 'bold 11px Inter, sans-serif';
        return ctx.measureText(line).width;
      }));
      
      const radiusForWidth = (maxTextWidth / 2) + padding;
      const radiusForHeight = (textHeight / 2) + padding;
      
      return Math.max(radiusForWidth, radiusForHeight, 35);
    };

    // Function to check if two circles intersect
    const circlesIntersect = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return distance < (r1 + r2 + 40);
    };

    // Function to adjust positions to prevent intersections and ensure visibility
    const adjustPositions = (nodes: any[], canvasWidth: number, canvasHeight: number) => {
      const adjustedNodes = [...nodes];
      const maxIterations = 150;
      const margin = 20; // Margin from canvas edges
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let hasIntersection = false;
        
        // Check and fix intersections
        for (let i = 0; i < adjustedNodes.length; i++) {
          for (let j = i + 1; j < adjustedNodes.length; j++) {
            const node1 = adjustedNodes[i];
            const node2 = adjustedNodes[j];
            
            if (circlesIntersect(node1.screenX, node1.screenY, node1.radius, node2.screenX, node2.screenY, node2.radius)) {
              hasIntersection = true;
              
              const dx = node2.screenX - node1.screenX;
              const dy = node2.screenY - node1.screenY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                const overlap = (node1.radius + node2.radius + 40) - distance;
                const moveX = (dx / distance) * overlap * 0.5;
                const moveY = (dy / distance) * overlap * 0.5;
                
                node1.screenX -= moveX;
                node1.screenY -= moveY;
                node2.screenX += moveX;
                node2.screenY += moveY;
              }
            }
          }
        }
        
        // Ensure nodes stay within canvas bounds
        adjustedNodes.forEach(node => {
          const minX = margin + node.radius;
          const maxX = canvasWidth - margin - node.radius;
          const minY = margin + node.radius;
          const maxY = canvasHeight - margin - node.radius;
          
          node.screenX = Math.max(minX, Math.min(maxX, node.screenX));
          node.screenY = Math.max(minY, Math.min(maxY, node.screenY));
        });
        
        if (!hasIntersection) break;
      }
      
      return adjustedNodes;
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Dynamically adjust scale based on canvas size and number of nodes
      const baseScale = Math.min(rect.width, rect.height) / 8;
      const scale = Math.max(baseScale, 60);

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Calculate node positions and radii
      const nodesWithPositions = data.nodes.map(node => {
        const radius = calculateNodeRadius(node.label);
        
        return {
          ...node,
          screenX: centerX + node.x * scale,
          screenY: centerY + node.y * scale,
          z: node.z,
          radius: radius
        };
      });

      // Adjust positions to prevent intersections and ensure visibility
      const adjustedNodes = adjustPositions(nodesWithPositions, rect.width, rect.height);

      // Draw links
      data.links.forEach(link => {
        const sourceNode = adjustedNodes.find(n => n.id === link.source);
        const targetNode = adjustedNodes.find(n => n.id === link.target);
        
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

        // Draw link
        ctx.beginPath();
        ctx.moveTo(startEdgeX, startEdgeY);
        ctx.lineTo(endEdgeX, endEdgeY);
        ctx.strokeStyle = link.color;
        ctx.lineWidth = link.width || 2;
        
        if (link.style === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.stroke();

        // Draw link label with background
        const midX = (startEdgeX + endEdgeX) / 2;
        const midY = (startEdgeY + endEdgeY) / 2;
        
        ctx.font = '11px Inter, sans-serif';
        const textMetrics = ctx.measureText(link.label);
        const textWidth = textMetrics.width;
        const textHeight = 14;
        
        // Draw text background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(midX - textWidth/2 - 6, midY - textHeight/2 - 3, textWidth + 12, textHeight + 6);
        
        // Draw text border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeRect(midX - textWidth/2 - 6, midY - textHeight/2 - 3, textWidth + 12, textHeight + 6);
        
        // Draw text
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText(link.label, midX, midY + 4);
      });

      // Draw nodes with multi-line text
      adjustedNodes.forEach(node => {
        const screenX = node.screenX;
        const screenY = node.screenY;
        const radius = node.radius;

        // Draw node circle with gradient
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, node.color + 'DD');
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add inner shadow
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius - 3, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw multi-line node label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const maxLineWidth = radius * 1.6;
        const lines = splitTextIntoLines(node.label, maxLineWidth);
        const lineHeight = 14;
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
