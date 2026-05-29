export type Point = { x: number; y: number };

export const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const abSlopeForAngle = (angleDeg: number) => {
  const boundedAngle = clampNumber(angleDeg, -89.5, 89.5);
  return Math.tan((boundedAngle * Math.PI) / 180);
};

export const splitBoundsForSlope = (slope: number) => {
  const cornerConstants = [
    0 + slope * (0 - 50),
    100 + slope * (0 - 50),
    0 + slope * (100 - 50),
    100 + slope * (100 - 50),
  ];
  return {
    max: Math.max(...cornerConstants),
    min: Math.min(...cornerConstants),
  };
};

const xOnSplitLine = (split: number, slope: number, y: number) => split - slope * (y - 50);

export const splitLineIntersections = (split: number, slope: number): [Point, Point] => {
  const candidates: Point[] = [
    { x: xOnSplitLine(split, slope, 0), y: 0 },
    { x: xOnSplitLine(split, slope, 100), y: 100 },
  ];
  if (Math.abs(slope) > 0.0001) {
    candidates.push({ x: 0, y: 50 + split / slope });
    candidates.push({ x: 100, y: 50 + (split - 100) / slope });
  }
  const unique = candidates
    .filter((point) => point.x >= -0.001 && point.x <= 100.001 && point.y >= -0.001 && point.y <= 100.001)
    .map((point) => ({ x: clampNumber(point.x, 0, 100), y: clampNumber(point.y, 0, 100) }))
    .filter((point, index, points) => points.findIndex((candidate) => Math.abs(candidate.x - point.x) < 0.01 && Math.abs(candidate.y - point.y) < 0.01) === index);
  if (unique.length < 2) {
    const fallback = clampNumber(split, 0, 100);
    return [{ x: fallback, y: 0 }, { x: fallback, y: 100 }];
  }
  return [unique[0], unique[1]];
};

export const clipPolygonForSplit = (split: number, slope: number) => {
  const inside = (point: Point) => point.x + slope * (point.y - 50) >= split;
  const intersect = (start: Point, end: Point) => {
    const startValue = start.x + slope * (start.y - 50) - split;
    const endValue = end.x + slope * (end.y - 50) - split;
    const amount = startValue / (startValue - endValue || 1);
    return {
      x: start.x + (end.x - start.x) * amount,
      y: start.y + (end.y - start.y) * amount,
    };
  };
  const rectangle: Point[] = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const clipped = rectangle.reduce<Point[]>((output, current, index) => {
    const previous = rectangle[(index + rectangle.length - 1) % rectangle.length];
    const currentInside = inside(current);
    const previousInside = inside(previous);
    if (currentInside && !previousInside) output.push(intersect(previous, current));
    if (currentInside) output.push(current);
    if (!currentInside && previousInside) output.push(intersect(previous, current));
    return output;
  }, []);
  if (clipped.length === 0) return 'polygon(100% 0, 100% 100%, 100% 100%)';
  return `polygon(${clipped.map((point) => `${point.x}% ${point.y}%`).join(', ')})`;
};

export const hitPolygonForLine = (start: Point, end: Point) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = 2.6;
  const nx = (-dy / length) * offset;
  const ny = (dx / length) * offset;
  return `polygon(${[
    { x: start.x + nx, y: start.y + ny },
    { x: end.x + nx, y: end.y + ny },
    { x: end.x - nx, y: end.y - ny },
    { x: start.x - nx, y: start.y - ny },
  ].map((point) => `${point.x}% ${point.y}%`).join(', ')})`;
};
