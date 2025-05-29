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

    // Smoother animation with reduced calculation complexity
    const calculateNodeRadius = (text: string, baseRadius: number = 30) => {
      ctx.font = 'bold 11px Inter, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const minRadius = Math.max(baseRadius, (textWidth / 2) + 15);
      return Math.min(minRadius, 60);
    };

    // Simplified collision detection for better performance
    const circlesIntersect = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (r1 + r2 + 15);
    };

    // Optimized position adjustment with fewer iterations
    const adjustPositions = (nodes: any[]) => {
      const adjustedNodes = [...nodes];
      const maxIterations = 20; // Reduced for smoother performance
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let hasIntersection = false;
        
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
                const overlap = (node1.radius + node2.radius + 15) - distance;
                const moveX = (dx / distance) * overlap * 0.3; // Reduced movement for smoother animation
                const moveY = (dy / distance) * overlap * 0.3;
                
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
      const scale = 60; // Reduced scale for better vertical layout

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Smoother rotation with optimized calculations
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      // Cache calculations for better performance
      const nodesWithPositions = data.nodes.map(node => {
        const x = node.x * cos - node.z * sin;
        const y = node.y; // Keep vertical positioning stable
        const z = node.x * sin + node.z * cos;
        const radius = calculateNodeRadius(node.label);
        
        return {
          ...node,
          screenX: centerX + x * scale,
          screenY: centerY + y * scale,
          z: z,
          radius: radius + z * 2 // Reduced perspective effect for smoother appearance
        };
      });

      const adjustedNodes = adjustPositions(nodesWithPositions);

      // Optimized link drawing
      data.links.forEach(link => {
        const sourceNode = adjustedNodes.find(n => n.id === link.source);
        const targetNode = adjustedNodes.find(n => n.id === link.target);
        
        if (!sourceNode || !targetNode) return;

        const dx = targetNode.screenX - sourceNode.screenX;
        const dy = targetNode.screenY - sourceNode.screenY;
        const angle = Math.atan2(dy, dx);
        
        const startEdgeX = sourceNode.screenX + Math.cos(angle) * sourceNode.radius;
        const startEdgeY = sourceNode.screenY + Math.sin(angle) * sourceNode.radius;
        const endEdgeX = targetNode.screenX - Math.cos(angle) * targetNode.radius;
        const endEdgeY = targetNode.screenY - Math.sin(angle) * targetNode.radius;

        // Smooth line drawing
        ctx.beginPath();
        ctx.moveTo(startEdgeX, startEdgeY);
        ctx.lineTo(endEdgeX, endEdgeY);
        ctx.strokeStyle = link.color;
        ctx.lineWidth = link.width || 2;
        ctx.setLineDash(link.style === 'dashed' ? [5, 5] : []);
        ctx.stroke();

        // Optimized label drawing
        const midX = (startEdgeX + endEdgeX) / 2;
        const midY = (startEdgeY + endEdgeY) / 2;
        
        ctx.font = '11px Inter, sans-serif';
        const textMetrics = ctx.measureText(link.label);
        const textWidth = textMetrics.width;
        const textHeight = 14;
        
        // Simple background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(midX - textWidth/2 - 4, midY - textHeight/2 - 2, textWidth + 8, textHeight + 4);
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeRect(midX - textWidth/2 - 4, midY - textHeight/2 - 2, textWidth + 8, textHeight + 4);
        
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText(link.label, midX, midY + 4);
      });

      // Optimized node drawing
      adjustedNodes.forEach(node => {
        const screenX = node.screenX;
        const screenY = node.screenY;
        const radius = node.radius;

        // Simplified gradient for better performance
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, node.color + 'BB');
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Optimized text rendering
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Simple text handling
        const words = node.label.split(' ');
        if (words.length > 1 && ctx.measureText(node.label).width > radius * 1.6) {
          const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
          ctx.fillText(line1, screenX, screenY - 3);
          ctx.fillText(line2, screenX, screenY + 9);
        } else {
          ctx.fillText(node.label, screenX, screenY + 3);
        }
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });

      rotation += 0.005; // Slower, smoother rotation
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
