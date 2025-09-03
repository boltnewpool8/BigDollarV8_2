import { Guide } from '../types';

export const weightedRandomSelection = (guides: Guide[], count: number): Guide[] => {
  const availableGuides = [...guides];
  const winners: Guide[] = [];

  for (let i = 0; i < count && availableGuides.length > 0; i++) {
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
  
  return winners;
};