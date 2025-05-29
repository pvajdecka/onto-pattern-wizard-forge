
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

    // Function to calculate optimal node radius based on text
    const calculateNodeRadius = (text: string, baseRadius: number = 35) => {
      ctx.font = 'bold 12px Inter, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const minRadius = Math.max(baseRadius, (textWidth / 2) + 20);
      return Math.min(minRadius, 80); // Increased cap to 80px
    };

    // Function to check if two circles intersect
    const circlesIntersect = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return distance < (r1 + r2 + 30); // Increased buffer to 30px
    };

    // Function to adjust positions to prevent intersections
    const adjustPositions = (nodes: any[]) => {
      const adjustedNodes = [...nodes];
      const maxIterations = 100;
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let hasIntersection = false;
        
        for (let i = 0; i < adjustedNodes.length; i++) {
          for (let j = i + 1; j < adjustedNodes.length; j++) {
            const node1 = adjustedNodes[i];
            const node2 = adjustedNodes[j];
            
            if (circlesIntersect(node1.screenX, node1.screenY, node1.radius, node2.screenX, node2.screenY, node2.radius)) {
              hasIntersection = true;
              
              // Calculate repulsion vector
              const dx = node2.screenX - node1.screenX;
              const dy = node2.screenY - node1.screenY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                const overlap = (node1.radius + node2.radius + 30) - distance;
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
        
        if (!hasIntersection) break;
      }
      
      return adjustedNodes;
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = 100; // Increased scale for better visibility

      ctx.clearRect(0, 0, rect.width, rect.height);

      // No rotation - static positions
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

      // Adjust positions to prevent intersections
      const adjustedNodes = adjustPositions(nodesWithPositions);

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

        // Draw label with background
        const midX = (startEdgeX + endEdgeX) / 2;
        const midY = (startEdgeY + endEdgeY) / 2;
        
        ctx.font = '12px Inter, sans-serif';
        const textMetrics = ctx.measureText(link.label);
        const textWidth = textMetrics.width;
        const textHeight = 16;
        
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
        ctx.fillText(link.label, midX, midY + 5);
      });

      // Draw nodes
      adjustedNodes.forEach(node => {
        const screenX = node.screenX;
        const screenY = node.screenY;
        const radius = node.radius;

        // Draw node circle with gradient
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, node.color + 'DD'); // Add transparency at edges
        
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

        // Draw node label with proper sizing
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Handle multi-line text for long labels
        const words = node.label.split(' ');
        if (words.length > 1 && ctx.measureText(node.label).width > radius * 1.4) {
          const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
          ctx.fillText(line1, screenX, screenY - 4);
          ctx.fillText(line2, screenX, screenY + 10);
        } else {
          ctx.fillText(node.label, screenX, screenY + 4);
        }
        
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
