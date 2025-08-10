import { Stage, Layer, Image as KonvaImage, Circle } from 'react-konva';
import useImage from 'use-image';
import useImage from 'react-konva/lib/react/useImage';
import { useState } from 'react';

interface Point {
  x: number;
  y: number;
}

export default function FaceMap() {
  const [faceImage] = useImage('/face-drawing.png'); // Make sure this image exists in /public
  const [points, setPoints] = useState<Point[]>([]);

  const handleClick = (e: any) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (pointer) {
      setPoints([...points, pointer]);
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Stage
        width={500}
        height={600}
        onClick={handleClick}
        className="border border-gray-300 shadow-md"
      >
        <Layer>
          <KonvaImage image={faceImage} width={500} height={600} />
          {points.map((pt, i) => (
            <Circle key={i} x={pt.x} y={pt.y} radius={5} fill="red" />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
