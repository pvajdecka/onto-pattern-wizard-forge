
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

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = 60;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Apply rotation
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      // Draw links
      data.links.forEach(link => {
        const sourceNode = data.nodes.find(n => n.id === link.source);
        const targetNode = data.nodes.find(n => n.id === link.target);
        
        if (!sourceNode || !targetNode) return;

        // 3D to 2D projection with rotation
        const sx = sourceNode.x * cos - sourceNode.z * sin;
        const sy = sourceNode.y;
        const tx = targetNode.x * cos - targetNode.z * sin;
        const ty = targetNode.y;

        const startX = centerX + sx * scale;
        const startY = centerY + sy * scale;
        const endX = centerX + tx * scale;
        const endY = centerY + ty * scale;

        // Draw link
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = link.color;
        ctx.lineWidth = link.width || 2;
        
        if (link.style === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.stroke();

        // Draw label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(link.label, midX, midY - 8);
      });

      // Draw nodes
      data.nodes.forEach(node => {
        // 3D to 2D projection with rotation
        const x = node.x * cos - node.z * sin;
        const y = node.y;
        const z = node.x * sin + node.z * cos;

        const screenX = centerX + x * scale;
        const screenY = centerY + y * scale;
        const radius = 25 + z * 5; // Perspective effect

        // Draw node circle
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw node label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, screenX, screenY + 4);
      });

      rotation += 0.01;
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
