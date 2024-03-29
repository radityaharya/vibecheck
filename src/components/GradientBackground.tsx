"use client";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useRef, useEffect, useLayoutEffect } from "react";
import { Gradient } from "~/components/gradients";

const gradient = new Gradient();

interface Props {
  showGradient?: boolean;
}

export const GradientBackground: React.FC<Props> = (props) => {
  const showGradient = props.showGradient ?? true;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (showGradient) {
      gradient.initGradient("#gradient-canvas");
    }
  }, [showGradient]);

  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  return (
    <canvas
      id="gradient-canvas"
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
    />
  );
};

export default GradientBackground;
