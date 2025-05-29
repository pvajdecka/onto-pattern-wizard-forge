
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
  isShortcut?: boolean;
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
      return Math.min(minRadius, 70); // Cap at 70px for better visibility
    };

    // Function to draw curved line for shortcut properties
    const drawCurvedLink = (startX: number, startY: number, endX: number, endY: number, color: string, width: number, label: string) => {
      // Calculate control point for curve (arc outward)
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Calculate perpendicular offset for curve
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;
      
      // Perpendicular vector (rotate 90 degrees)
      const perpX = -unitY;
      const perpY = unitX;
      
      // Control point offset (curve outward more for better visibility)
      const curveOffset = 120;
      const controlX = midX + perpX * curveOffset;
      const controlY = midY + perpY * curveOffset;

      // Draw curved path
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash([]);
      ctx.stroke();

      // Draw label at the curve's peak
      ctx.font = 'bold 12px Inter, sans-serif';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      
      // Draw text background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(controlX - textWidth/2 - 6, controlY - textHeight/2 - 3, textWidth + 12, textHeight + 6);
      
      // Draw text border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(controlX - textWidth/2 - 6, controlY - textHeight/2 - 3, textWidth + 12, textHeight + 6);
      
      // Draw text
      ctx.fillStyle = '#1e40af';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(label, controlX, controlY + 5);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = 120; // Increased scale for better visibility

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Static positioning - no rotation
      const nodesWithPositions = data.nodes.map(node => {
        const radius = calculateNodeRadius(node.label);
        
        return {
          ...node,
          screenX: centerX + node.x * scale,
          screenY: centerY + node.y * scale,
          radius: radius
        };
      });

      // Draw links first (so they appear behind nodes)
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

        // Check if this is a shortcut property (blue color and width 3)
        const isShortcut = link.color === '#3b82f6' && link.width === 3;

        if (isShortcut) {
          // Draw curved link for shortcut properties
          drawCurvedLink(startEdgeX, startEdgeY, endEdgeX, endEdgeY, link.color, link.width, link.label);
        } else {
          // Draw regular straight link
          ctx.beginPath();
          ctx.moveTo(startEdgeX, startEdgeY);
          ctx.lineTo(endEdgeX, endEdgeY);
          ctx.strokeStyle = link.color;
          ctx.lineWidth = link.width || 2;
          
          if (link.style === 'dashed') {
            ctx.setLineDash([8, 6]);
          } else {
            ctx.setLineDash([]);
          }
          
          ctx.stroke();

          // Draw label with background for regular links
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
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText(link.label, midX, midY + 5);
        }
      });

      // Draw nodes on top
      nodesWithPositions.forEach(node => {
        const screenX = node.screenX;
        const screenY = node.screenY;
        const radius = node.radius;

        // Draw node circle with enhanced gradient
        const gradient = ctx.createRadialGradient(screenX - radius/3, screenY - radius/3, 0, screenX, screenY, radius);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(0.7, node.color);
        gradient.addColorStop(1, node.color + '80'); // More transparency at edges
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Enhanced border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Add subtle inner shadow
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius - 3, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw node label with enhanced styling
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
          ctx.fillText(line2, screenX, screenY + 12);
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

    // Draw once - no animation loop
    draw();

    // Redraw on resize
    const handleResize = () => {
      resizeCanvas();
      draw();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
    />
  );
};
