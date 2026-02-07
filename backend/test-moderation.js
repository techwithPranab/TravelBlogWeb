const { moderationService } = require('./src/services/moderationService');

(async () => {
  const testText = "his itinerary was amazing! The beaches were beautiful, food was delicious, and the local culture was fascinating. Highly recommend for anyone visiting.";

  console.log('Testing text:', testText);
  console.log('');

  const result = await moderationService.checkForOffensiveContent(testText, 10);
  console.log('Moderation result:');
  console.log(JSON.stringify(result, null, 2));

  console.log('');
  console.log('Flagged words:', moderationService.getFlaggedWords(testText));
})();
