export const defaultConfig = {
  height: 900,
  width: 500,
  tickFormat: {
    value: '',
    date: '%Y',
    scale: '',
    currency: '',
  },
  padding: {
    top: 50,
    right: 30,
    bottom: 50,
    left: 40,
  },
};


export const getPolygonString = (x: any, y: any, size: number) => {
  const roundedX = parseInt(x);
  const roundedY = parseInt(y);

  const point1 = `${roundedX},${roundedY + size * 2}`;
  const point2 = `${roundedX - size * 1.5},${roundedY - size / 4}`;
  const point3 = `${roundedX + size * 1.5},${roundedY - (size / 4)}`;

  return `${point1} ${point2} ${point3}`;
}