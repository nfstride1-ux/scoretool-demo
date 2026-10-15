/* Coach card wording, keyed by how the archer's latest real shoot went.
   PLACEHOLDER text based on the George Ryles notes from Archery Coach. Swap in final wording here.
   Placeholders: {score} {round} {pb} {usual} {diff} {date}
   Each line: [text, citation or ''] . Only George's exact words go in "quote marks". */
window.COACH_MSG={
 pb:{kicker:'New personal best 🏆',title:'You did it! {score} on {round}',intro:'That beats your old best of {pb}. Big scores just happen when you shoot one good arrow at a time.',introCite:'S1 67:24, in simple words',
  lines:[['Save today in your evidence bank, so you can read it before your next big shoot.',''],['Tell me about your best shot today. What made it feel good?','TAW #74, in simple words'],['Keep doing what worked. Don\'t change your gear after a great day.','S2 00:47, in simple words']]},
 great:{kicker:'Great shoot 🌟',title:'{score} on {round}. Right up near your best!',intro:'Only {diff} points off your PB of {pb}. That\'s top form.',introCite:'',
  lines:[['Tell me about your best shot today.','TAW #74, in simple words'],['Big scores just happen when you shoot one good arrow at a time.','S1 67:24, in simple words'],['Keep the same routine next time: one arrow, this one.','S1 73:43, in simple words']]},
 solid:{kicker:'Solid shoot 👍',title:'{score} on {round}',intro:'Right around your usual of {usual}. Steady shooting builds big scores.',introCite:'',
  lines:[['Pick one thing you control next time (setup, tempo or follow-through) and give yourself a 👍 each end you do it.',''],['Compare across months, not one day.','S1 147:11, in simple words']]},
 tough:{kicker:'Comeback plan',title:'Tough day? Totally normal.',intro:'{score} on {round} was {diff} below your usual of {usual}. Even the best archers have days like that. Let\'s rebuild with some easy wins:',introCite:'',
  steps:[['<b>Move closer or use a bigger face</b> for 3 ends. Aim to get 2 out of 3 arrows in the gold (X, 10 or 9). Smooth shots matter more than Xs.','S2 08:50, TAW #116'],
   ['<b>Walk back</b> a couple of metres at a time. Only move once it feels easy.','TAW #116, #138'],
   ['<b>Between ends</b>, replay your best shot in your head.','S1 108:41, TAW #96'],
   ['<b>Pick one thing you control</b>, like your shot routine or follow-through, and give yourself a 👍 for each end where you did it.','']],
  lines:[['"You can\'t have confidence without success." So set up easy wins first.','S1 147:11'],['Hard days make you better. Compare across months, not one day.','S1 147:11, in simple words']]},
 incomplete:{kicker:'Round not finished',title:'{round} on {date}',intro:'This round wasn\'t completed, so it isn\'t counted in your PBs or charts. That\'s OK.',introCite:'',
  lines:[['Feel funny? Let it down, shake it out, start again. That\'s a pro move.','S1 44:15, in simple words'],['If you stopped because of a sore body, tell your coach or parent.','']]},
 first:{kicker:'First one logged',title:'{score} on {round}',intro:'This is your first score on this round, so it\'s your PB to beat next time!',introCite:'',lines:[['Tell me about your best shot today.','TAW #74, in simple words']]}
};
