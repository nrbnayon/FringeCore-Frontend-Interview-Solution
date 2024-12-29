import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const INITIAL_SPEED = 30;
const FRICTION = 0.005;
const MIN_SPEED = 0.5;

const App = () => {
  const canvasRef = useRef(null);
  const ballRef = useRef(null);
  const [ballState, setBallState] = useState({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    isMoving: false,
  });
  const [showInstructions, setShowInstructions] = useState(true);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ball = ballRef.current;

    if (canvas && ball) {
      const canvasWidth = canvas.offsetWidth;
      const canvasHeight = canvas.offsetHeight;
      const ballWidth = ball.offsetWidth;
      const ballHeight = ball.offsetHeight;

      const centerX = (canvasWidth - ballWidth) / 2;
      const centerY = (canvasHeight - ballHeight) / 2;

      setBallState((prev) => ({
        ...prev,
        x: centerX,
        y: centerY,
      }));

      setCanvasDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ball = ballRef.current;

    const updateBallPosition = () => {
      if (!ballState.isMoving) return;

      const speed = Math.sqrt(ballState.vx ** 2 + ballState.vy ** 2);
      const frictionReduction = Math.max(speed - FRICTION, 0);
      const reductionRatio = speed > 0 ? frictionReduction / speed : 0;

      const newVx = ballState.vx * reductionRatio;
      const newVy = ballState.vy * reductionRatio;

      let newX = ballState.x + newVx;
      let newY = ballState.y + newVy;

      const ballWidth = ball.offsetWidth;
      const ballHeight = ball.offsetHeight;
      const canvasWidth = canvas.offsetWidth;
      const canvasHeight = canvas.offsetHeight;

      let bounceX = false;
      let bounceY = false;

      if (newX <= 0) {
        newX = 0;
        bounceX = true;
      } else if (newX + ballWidth >= canvasWidth) {
        newX = canvasWidth - ballWidth;
        bounceX = true;
      }

      if (newY <= 0) {
        newY = 0;
        bounceY = true;
      } else if (newY + ballHeight >= canvasHeight) {
        newY = canvasHeight - ballHeight;
        bounceY = true;
      }

      const bounceDamping = 0.8;
      const newState = {
        x: newX,
        y: newY,
        vx: bounceX ? -newVx * bounceDamping : newVx,
        vy: bounceY ? -newVy * bounceDamping : newVy,
        isMoving: frictionReduction > MIN_SPEED,
      };

      setBallState(newState);

      if (!newState.isMoving) {
        setShowInstructions(true);
      }

      requestAnimationFrame(updateBallPosition);
    };

    if (ballState.isMoving) {
      requestAnimationFrame(updateBallPosition);
    }
  }, [ballState]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const ball = ballRef.current;

    const rect = canvas.getBoundingClientRect();
    const canvasCenterX = canvasDimensions.width / 2;
    const canvasCenterY = canvasDimensions.height / 2;
    const clickX = e.clientX - rect.left - ball.offsetWidth / 2;
    const clickY = e.clientY - rect.top - ball.offsetHeight / 2;

    const dx = clickX - canvasCenterX;
    const dy = clickY - canvasCenterY;
    const angle = Math.atan2(dy, dx);

    setBallState({
      x: canvasCenterX,
      y: canvasCenterY,
      vx: INITIAL_SPEED * Math.cos(angle),
      vy: INITIAL_SPEED * Math.sin(angle),
      isMoving: true,
    });

    setShowInstructions(false);
  };

  return (
    <div ref={canvasRef} id='canvas' onClick={handleCanvasClick}>
      <div
        ref={ballRef}
        id='ball'
        style={{
          left: ballState.x,
          top: ballState.y,
          transform: "translate(-50%, -50%)",
          transition: "none",
        }}
      />
      {showInstructions && (
        <div id='instructions'>Click to launch the ball!</div>
      )}
    </div>
  );
};

export default App;
