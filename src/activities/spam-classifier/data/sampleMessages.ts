export interface SampleMessage {
  id: string;
  text: string;
  hint?: 'safe' | 'suspicious'; // Optional hint for students
}

export const sampleMessages: SampleMessage[] = [
  // Clearly safe messages
  { id: 's1', text: "Hey, are we still on for lunch today?", hint: 'safe' },
  { id: 's2', text: "Mom said to pick up milk on the way home", hint: 'safe' },
  { id: 's3', text: "Practice is at 4pm today, don't forget your cleats", hint: 'safe' },
  { id: 's4', text: "Can you send me the math homework questions?", hint: 'safe' },
  { id: 's5', text: "Happy birthday! Hope you have an awesome day 🎂", hint: 'safe' },
  { id: 's6', text: "Movie starts at 7, meet at the theater at 6:30", hint: 'safe' },
  { id: 's7', text: "Thanks for helping me with my science project!", hint: 'safe' },
  { id: 's8', text: "Reminder: library books are due this Friday", hint: 'safe' },
  { id: 's9', text: "Great game yesterday! You played really well", hint: 'safe' },
  { id: 's10', text: "Can I borrow your notes from history class?", hint: 'safe' },
  { id: 's11', text: "Dad is picking us up after school today", hint: 'safe' },
  { id: 's12', text: "The field trip permission slip is due tomorrow", hint: 'safe' },
  { id: 's13', text: "Want to study together for the test on Thursday?", hint: 'safe' },
  { id: 's14', text: "Just finished reading that book you recommended, it was great!", hint: 'safe' },
  { id: 's15', text: "Class got moved to room 204 today", hint: 'safe' },

  // Clearly suspicious messages
  { id: 'x1', text: "CONGRATULATIONS!!! You WON a FREE iPhone 16!!!", hint: 'suspicious' },
  { id: 'x2', text: "URGENT: Click HERE to claim your $1000 gift card NOW", hint: 'suspicious' },
  { id: 'x3', text: "Your account will be DELETED unless you verify immediately!!!", hint: 'suspicious' },
  { id: 'x4', text: "Make $5000 per week working from home!!! No experience needed!!", hint: 'suspicious' },
  { id: 'x5', text: "WARNING: Your computer has been INFECTED! Download fix NOW", hint: 'suspicious' },
  { id: 'x6', text: "You have been selected as our LUCKY WINNER! Claim prize here →", hint: 'suspicious' },
  { id: 'x7', text: "FREE Netflix subscription!!! Just enter your password to activate", hint: 'suspicious' },
  { id: 'x8', text: "Act NOW! This offer expires in 5 MINUTES!! Don't miss out!!!", hint: 'suspicious' },
  { id: 'x9', text: "Dear user, we detected unusual activity. Verify your identity IMMEDIATELY", hint: 'suspicious' },
  { id: 'x10', text: "Get rich quick! Secret investment opportunity with GUARANTEED returns!!!", hint: 'suspicious' },
  { id: 'x11', text: "Your package could not be delivered. Click to update payment info", hint: 'suspicious' },
  { id: 'x12', text: "EXCLUSIVE DEAL: 95% OFF designer shoes today only!!!", hint: 'suspicious' },
  { id: 'x13', text: "Someone tried to log into your account! Reset password NOW", hint: 'suspicious' },
  { id: 'x14', text: "You've been chosen for a FREE vacation trip!!! Reply with your details", hint: 'suspicious' },
  { id: 'x15', text: "LAST CHANCE: Unlimited data plan for only $1/month!!!", hint: 'suspicious' },
];

// Extra messages revealed by "Need more?" button
export const bonusMessages: SampleMessage[] = [
  { id: 'b1', text: "See you at band practice after school", hint: 'safe' },
  { id: 'b2', text: "ACT NOW or lose your chance to WIN BIG!!!", hint: 'suspicious' },
  { id: 'b3', text: "Did you finish the art project? It looks amazing", hint: 'safe' },
  { id: 'b4', text: "DOUBLE your followers with this ONE weird trick!!!", hint: 'suspicious' },
  { id: 'b5', text: "Grandma says dinner is at 6pm on Sunday", hint: 'safe' },
  { id: 'b6', text: "Your subscription has EXPIRED! Renew NOW to avoid losing data!!!", hint: 'suspicious' },
];

// Suggested test messages for Step 3
export const testSuggestions: string[] = [
  "Hey want to grab pizza after school?",
  "CLICK HERE for FREE MONEY!!!",
  "The soccer game got moved to Tuesday",
  "WARNING: Your account needs immediate action!",
  "Thanks for the birthday present!",
  "You won a brand new car! Call now!",
];
