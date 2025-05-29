
export const splitTextIntoLines = (text: string, maxWidth: number, ctx: CanvasRenderingContext2D) => {
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

export const calculateNodeRadius = (text: string, ctx: CanvasRenderingContext2D) => {
  const maxLineWidth = 100;
  const lines = splitTextIntoLines(text, maxLineWidth, ctx);
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
