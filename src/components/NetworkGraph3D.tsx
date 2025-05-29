
import React, { useRef, useEffect } from 'react';
import type { GraphData } from '@/types/graph';
import { calculateNodeRadius } from '@/utils/textUtils';
import { calculateNodePositions } from '@/utils/positionUtils';
import { drawLinks, drawNodes } from '@/utils/drawingUtils';

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

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Add margins to ensure complete graph fits
      const margin = 120;
      const usableWidth = rect.width - (margin * 2);
      const usableHeight = rect.height - (margin * 2);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Check if we have a shortcut link (generated result)
      const hasShortcut = data.links.some(link => link.width && link.width > 2);

      // Calculate maximum node radius to adjust spacing
      const maxRadius = Math.max(...data.nodes.map(node => calculateNodeRadius(node.label, ctx)));
      
      // Dynamic spacing based on container size and max radius
      const baseSpacing = Math.min(usableWidth, usableHeight) / 4;
      const nodeSpacing = Math.max(baseSpacing, maxRadius * 3.5);

      // Calculate node positions with safe bounds
      const nodesWithPositions = calculateNodePositions(
        data.nodes,
        hasShortcut,
        centerX,
        centerY,
        nodeSpacing,
        margin,
        rect.width,
        rect.height,
        ctx
      );

      // Draw links with improved positioning to avoid intersections
      drawLinks(ctx, data.links, nodesWithPositions, margin, rect.width, rect.height);

      // Draw nodes with multi-line text
      drawNodes(ctx, nodesWithPositions);
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
