const { calculateBurnoutScore, classifyRisk } = require('../utils/burnout');

describe('burnout utilities', () => {
  test('classifies thresholds correctly', () => {
    expect(classifyRisk(0)).toBe('Low');
    expect(classifyRisk(33)).toBe('Low');
    expect(classifyRisk(34)).toBe('Medium');
    expect(classifyRisk(66)).toBe('Medium');
    expect(classifyRisk(67)).toBe('High');
    expect(classifyRisk(100)).toBe('High');
  });

  test('computes bounded score and factors', () => {
    const result = calculateBurnoutScore({
      workloadIntensity: 120,
      sleepHours: 3,
      stressLevel: 120,
      upcomingDeadlines: 8,
      missedTasks: 6,
    });

    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.factors.workload).toBe(100);
    expect(result.factors.deadlinePressure).toBe(100);
    expect(result.factors.stressLevel).toBe(100);
    expect(result.riskLevel).toBe('High');
  });
});
