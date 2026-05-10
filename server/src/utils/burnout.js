/**
 * Burnout scoring utilities.
 */
const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const classifyRisk = (score) => {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
};

const calculateBurnoutScore = ({
  workloadIntensity,
  sleepHours,
  stressLevel,
  upcomingDeadlines,
  missedTasks,
}) => {
  const sleepDeficitScore = clamp((8 - sleepHours) * 12.5);
  const stressScore = clamp(stressLevel);
  const deadlineScore = clamp(upcomingDeadlines * 20);
  const missedTaskScore = clamp(missedTasks * 25);
  const workloadScore = clamp(workloadIntensity);

  const score = clamp(Math.round(
    (workloadScore * 0.3) +
    (sleepDeficitScore * 0.2) +
    (stressScore * 0.2) +
    (deadlineScore * 0.15) +
    (missedTaskScore * 0.15)
  ));

  return {
    score,
    riskLevel: classifyRisk(score),
    factors: {
      workload: workloadScore,
      sleepQuality: clamp(100 - sleepDeficitScore),
      stressLevel: stressScore,
      deadlinePressure: deadlineScore,
      upcomingDeadlines,
      missedTasks,
    },
  };
};

module.exports = {
  classifyRisk,
  calculateBurnoutScore,
};
