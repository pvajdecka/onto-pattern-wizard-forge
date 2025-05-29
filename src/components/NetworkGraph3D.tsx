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
  const animationRef = useRef<number>();

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

    let rotation = 0;

    // Function to calculate optimal node radius based on text
    const calculateNodeRadius = (text: string, baseRadius: number = 30) => {
      ctx.font = 'bold 11px Inter, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const minRadius = Math.max(baseRadius, (textWidth / 2) + 15);
      return Math.min(minRadius, 60); // Cap at 60px
    };

    // Simplified position adjustment without complex collision detection
    const adjustPositions = (nodes: any[]) => {
      return nodes.map(node => ({
        ...node,
        screenX: node.screenX,
        screenY: node.screenY,
        radius: node.radius
      }));
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = 80;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Apply smooth rotation
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      // Prepare nodes with screen positions and radii
      const nodesWithPositions = data.nodes.map(node => {
        const x = node.x * cos - node.z * sin;
        const y = node.y;
        const z = node.x * sin + node.z * cos;
        const radius = calculateNodeRadius(node.label);
        
        return {
          ...node,
          screenX: centerX + x * scale,
          screenY: centerY + y * scale,
          z: z,
          radius: radius + z * 2 // Subtle perspective effect
        };
      });

      // Use simplified position adjustment
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
        
        ctx.font = '11px Inter, sans-serif';
        const textMetrics = ctx.measureText(link.label);
        const textWidth = textMetrics.width;
        const textHeight = 14;
        
        // Draw text background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(midX - textWidth/2 - 4, midY - textHeight/2 - 2, textWidth + 8, textHeight + 4);
        
        // Draw text border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeRect(midX - textWidth/2 - 4, midY - textHeight/2 - 2, textWidth + 8, textHeight + 4);
        
        // Draw text
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText(link.label, midX, midY + 4);
      });

      // Draw nodes
      adjustedNodes.forEach(node => {
        const screenX = node.screenX;
        const screenY = node.screenY;
        const radius = node.radius;

        // Draw node circle with gradient
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, node.color + 'CC'); // Add transparency at edges
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add inner shadow
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius - 2, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw node label with proper sizing
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Handle multi-line text for long labels
        const words = node.label.split(' ');
        if (words.length > 1 && ctx.measureText(node.label).width > radius * 1.6) {
          const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
          ctx.fillText(line1, screenX, screenY - 3);
          ctx.fillText(line2, screenX, screenY + 9);
        } else {
          ctx.fillText(node.label, screenX, screenY + 3);
        }
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });

      rotation += 0.006; // Smooth rotation speed
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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
