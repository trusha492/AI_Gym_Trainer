/**
 * Mock AI Chat Response
 * Used for frontend development when backend/AI is not connected
 */

export const sendMessage = async (message) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    reply: `
🏋️ Suggested Fitness Plan:
• 30 minutes cardio (brisk walk or cycling)
• 3 sets of strength training
• Core exercises (planks, crunches)

🥗 Diet Recommendation:
• Protein intake: 1.6 g/kg body weight
• Include complex carbs (oats, brown rice)
• Add vegetables & hydration

📌 Tip:
Consistency matters more than intensity.
    `.trim()
  };
};
