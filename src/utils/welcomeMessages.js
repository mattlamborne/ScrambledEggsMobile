const welcomeMessages = [
  "{name}, time to cook… just try not to burn every shot this time.",
  "Back again? The course called — it said 'please don't'.",
  "{name}'s here! Everyone hide your scorecards and your dignity.",
  "Hope you brought a helmet. Those slices are getting violent.",
  "Back for more punishment? Bold move.",
  "{name}, your last round was so bad we almost uninstalled ourselves.",
  "Scramble mode: ON. Coordination: still questionable.",
  "Nice of you to show up, shank master general.",
  "{name}, welcome back. The bunkers missed your tears.",
  "They say golf is 90% mental… you're really proving that.",
  "Look who's back! The golf gods are already laughing.",
  "{name}, ready to make the course regret its existence?",
  "Welcome back, master of the triple bogey.",
  "The fairways are trembling at your return, {name}.",
  "Time to show those golf balls who's boss (spoiler: it's not you).",
  "Back for another round of 'how many strokes can I take?'",
  "{name}, the human embodiment of 'golf is hard'.",
  "Ready to redefine what 'bad golf' means?",
  "The course has been practicing while you were gone, {name}.",
  "Welcome back, destroyer of par.",
];

export function getWelcomeMessage(userName) {
  const fallbackMessage = "Track your scramble games";
  
  if (!userName) {
    return fallbackMessage;
  }
  
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  const message = welcomeMessages[randomIndex];
  
  return message.replace(/{name}/g, userName);
} 