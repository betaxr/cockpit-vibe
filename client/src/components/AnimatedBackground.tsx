import { useEffect, useState } from "react";

interface Circle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface AnimatedBackgroundProps {
  className?: string;
}

/**
 * Animated background with floating blurred circles
 * Creates a subtle, organic ambient effect
 */
export default function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    // Generate random circles on mount
    const generateCircles = () => {
      const newCircles: Circle[] = [];
      const count = 6; // Number of floating circles
      
      for (let i = 0; i < count; i++) {
        newCircles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 200 + Math.random() * 400, // 200-600px
          opacity: 0.15 + Math.random() * 0.25, // 0.15-0.4
          duration: 15 + Math.random() * 20, // 15-35s
          delay: Math.random() * -20, // Stagger start times
        });
      }
      setCircles(newCircles);
    };

    generateCircles();
  }, []);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, oklch(0.35 0.12 40 / 40%) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, oklch(0.30 0.10 50 / 30%) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 100%, oklch(0.25 0.08 45 / 50%) 0%, transparent 40%),
            linear-gradient(180deg, oklch(0.12 0.02 45) 0%, oklch(0.08 0.01 40) 100%)
          `,
        }}
      />
      
      {/* Animated floating circles */}
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute rounded-full"
          style={{
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            width: circle.size,
            height: circle.size,
            background: `radial-gradient(circle, oklch(0.55 0.18 45 / ${circle.opacity}) 0%, transparent 70%)`,
            filter: `blur(${circle.size * 0.3}px)`,
            transform: 'translate(-50%, -50%)',
            animation: `float-${circle.id} ${circle.duration}s ease-in-out infinite`,
            animationDelay: `${circle.delay}s`,
          }}
        />
      ))}
      
      {/* CSS Keyframes for floating animation */}
      <style>{`
        ${circles.map((circle) => `
          @keyframes float-${circle.id} {
            0%, 100% {
              transform: translate(-50%, -50%) translate(0px, 0px);
            }
            25% {
              transform: translate(-50%, -50%) translate(${30 + Math.random() * 40}px, ${-20 - Math.random() * 30}px);
            }
            50% {
              transform: translate(-50%, -50%) translate(${-20 - Math.random() * 30}px, ${20 + Math.random() * 40}px);
            }
            75% {
              transform: translate(-50%, -50%) translate(${-30 - Math.random() * 20}px, ${-30 - Math.random() * 20}px);
            }
          }
        `).join('\n')}
      `}</style>
      
      {/* Subtle noise overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
