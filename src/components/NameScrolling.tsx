import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guide, PrizeCategory } from '../types';
import { prizeCategories } from '../data/prizeCategories';

interface NameScrollingProps {
  guides: Guide[];
  isScrolling: boolean;
  onComplete: (winners: Guide[]) => void;
  winnerCount: number;
  prizeCategory?: PrizeCategory | null;
}

export const NameScrolling: React.FC<NameScrollingProps> = ({
  guides,
  isScrolling,
  onComplete,
  winnerCount,
  prizeCategory
}) => {
  const [phase, setPhase] = useState<'countdown' | 'revealing' | 'waiting' | 'complete'>('countdown');
  const [countdown, setCountdown] = useState(15);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [selectedWinners, setSelectedWinners] = useState<Guide[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Guide | null>(null);

  // Get countdown duration based on prize category
  const getCountdownDuration = (category: PrizeCategory | null): number => {
    if (!category) return 15; // Default
    
    switch (category.id) {
      case 'iron-box': return 7;      // 5th Prize
      case 'soundbars': return 10;    // 4th Prize  
      case 'washing-machine': return 15; // 3rd Prize
      case 'tablets': return 20;      // 2nd Prize
      case 'refrigerator': return 60; // 1st Prize
      default: return 15;
    }
  };

  useEffect(() => {
    if (!isScrolling || guides.length === 0) return;

    // Pre-calculate all winners using weighted selection
    const winners: Guide[] = [];
    const availableGuides = [...guides];
    
    for (let i = 0; i < winnerCount && availableGuides.length > 0; i++) {
      const totalWeight = availableGuides.reduce((sum, guide) => sum + guide.totalTickets, 0);
      let random = Math.random() * totalWeight;
      
      let selectedIndex = 0;
      for (let j = 0; j < availableGuides.length; j++) {
        random -= availableGuides[j].totalTickets;
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }
      
      const winner = availableGuides.splice(selectedIndex, 1)[0];
      winners.push(winner);
    }

    setSelectedWinners(winners);
    setCurrentWinnerIndex(0);
    setPhase('countdown');
    setCountdown(getCountdownDuration(prizeCategory));

    // Start with first winner countdown
    startCountdownForWinner(0);
  }, [isScrolling, guides, onComplete, winnerCount, prizeCategory]);

  const startCountdownForWinner = (winnerIndex: number) => {
    setCurrentWinnerIndex(winnerIndex);
    setPhase('countdown');
    const duration = getCountdownDuration(prizeCategory);
    setCountdown(duration);

    // Countdown timer
    let timeLeft = duration;
    const countdownInterval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        setPhase('revealing');
        setCurrentWinner(selectedWinners[winnerIndex]);
        
        // Show winner for 3 seconds, then wait for user input (or complete if last winner)
        setTimeout(() => {
          if (winnerIndex === selectedWinners.length - 1) {
            // Last winner - complete automatically
            setPhase('complete');
            setTimeout(() => {
              onComplete(selectedWinners);
            }, 2000);
          } else {
            // More winners - wait for user to click Next
            setPhase('waiting');
          }
        }, 3000);
      }
    }, 1000);
  };

  const handleNextWinner = () => {
    const nextIndex = currentWinnerIndex + 1;
    if (nextIndex < selectedWinners.length) {
      startCountdownForWinner(nextIndex);
    }
  };

  if (!isScrolling) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="text-center w-full max-w-4xl">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center"
          >
            <span className="text-4xl">🎰</span>
          </motion.div>
        </motion.div>

        {phase === 'countdown' && (
          <div>
            <motion.h2
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl md:text-5xl font-bold text-white mb-8"
            >
              {prizeCategory ? `${prizeCategory.icon} SELECTING ${prizeCategory.name} WINNER #${currentWinnerIndex + 1} ${prizeCategory.icon}` : `🎲 SELECTING WINNER #${currentWinnerIndex + 1} 🎲`}
            </motion.h2>

            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-6"
                >
                  {countdown}
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-yellow-300 text-xl font-semibold"
                >
                  ✨ Building suspense... ✨
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {phase === 'revealing' && currentWinner && (
          <div>
            <motion.h2
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl md:text-5xl font-bold text-white mb-8"
            >
              {prizeCategory ? `${prizeCategory.icon} ${prizeCategory.name} WINNER #${currentWinnerIndex + 1} ${prizeCategory.icon}` : `🏆 WINNER #${currentWinnerIndex + 1} 🏆`}
            </motion.h2>

            <motion.div
              initial={{ 
                scale: 0,
                opacity: 0,
                rotateY: 180
              }}
              animate={{ 
                scale: 1,
                opacity: 1,
                rotateY: 0
              }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl min-h-[400px] flex items-center justify-center"
            >
              <div className="text-center">
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-lg">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {currentWinner.name}
                  </div>
                  <div className="text-2xl text-white font-semibold mb-3">
                    {currentWinner.department}
                  </div>
                  <div className="text-xl text-white font-medium mb-4">
                    Supervisor: {currentWinner.supervisor}
                  </div>
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="bg-yellow-500/80 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">
                        {currentWinner.totalTickets} tickets
                      </span>
                    </div>
                    <div className="bg-green-500/80 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">
                        NPS: {currentWinner.nps}
                      </span>
                    </div>
                    <div className="bg-blue-500/80 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">
                        NRPC: {currentWinner.nrpc}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {phase === 'waiting' && currentWinner && (
          <div>
            <motion.h2
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl md:text-5xl font-bold text-white mb-8"
            >
              {prizeCategory ? `${prizeCategory.icon} ${prizeCategory.name} WINNER #${currentWinnerIndex + 1} ${prizeCategory.icon}` : `🏆 WINNER #${currentWinnerIndex + 1} 🏆`}
            </motion.h2>

            <motion.div
              initial={{ 
                scale: 0,
                opacity: 0,
                rotateY: 180
              }}
              animate={{ 
                scale: 1,
                opacity: 1,
                rotateY: 0
              }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl min-h-[400px] flex flex-col items-center justify-center"
            >
              <div className="text-center mb-8">
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-lg">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {currentWinner.name}
                  </div>
                  <div className="text-2xl text-white font-semibold mb-3">
                    {currentWinner.department}
                  </div>
                  <div className="text-xl text-white font-medium mb-4">
                    Supervisor: {currentWinner.supervisor}
                  </div>
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="bg-yellow-500/80 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">
                        {currentWinner.totalTickets} tickets
                      </span>
                    </div>
                    <div className="bg-green-500/80 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">
                        NPS: {currentWinner.nps}
                      </span>
                    </div>
                    <div className="bg-blue-500/80 rounded-lg px-4 py-3">
                      <span className="text-white font-bold">
                        NRPC: {currentWinner.nrpc}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextWinner}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-blue-600 focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 shadow-lg"
              >
                🎯 Next Winner ({currentWinnerIndex + 2} of {selectedWinners.length})
              </motion.button>
            </motion.div>
          </div>
        )}

        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent mb-4">
              🎉 ALL WINNERS SELECTED! 🎉
            </div>
            <div className="text-lg text-white">
              Congratulations to all {winnerCount} winners!
            </div>
          </motion.div>
        )}

        {/* Progress indicator */}
        {winnerCount > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <div className="flex justify-center space-x-2">
              {Array.from({ length: winnerCount }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index <= currentWinnerIndex 
                      ? 'bg-green-400 shadow-lg' 
                        : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm mt-2">
              Winner {currentWinnerIndex + 1} of {winnerCount}
            </p>
          </motion.div>
        )}

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/80 mt-6 text-lg"
        >
          {phase === 'countdown' && '✨ The magic is building... ✨'}
          {phase === 'revealing' && '🎉 Congratulations! 🎉'}
          {phase === 'waiting' && '🎯 Ready for the next winner? 🎯'}
          {phase === 'complete' && '🎉 All winners selected! 🎉'}
        </motion.div>
      </div>
    </div>
  );
};