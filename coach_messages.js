/* Coach card wording, keyed by how the archer's latest real shoot went.
   PLACEHOLDER wording, our own words. Ideas informed by coaching notes; do not copy any coach's phrases.
   Citations are kept for reference only and are not shown.
   Placeholders: {score} {round} {pb} {usual} {diff} {date}
   Each line: [text, citation or ''] . No direct quotes. */
window.COACH_MSG={
 pb:{kicker:'New personal best 🏆',title:'You did it! {score} on {round}',intro:'That beats your old best of {pb}. You put together a lot of good shots today.',introCite:'S1 67:24, in simple words',
  lines:[['Save today in your evidence bank, so you can read it before your next big shoot.',''],['Which shot felt the best? Remember what made it feel that way.','TAW #74, in simple words'],['Keep your setup the same. It\'s working!','S2 00:47, in simple words']]},
 great:{kicker:'Great shoot 🌟',title:'{score} on {round}. Right up near your best!',intro:'Only {diff} points off your PB of {pb}. That\'s top form.',introCite:'',
  lines:[['Which shot felt the best? Tell someone about it.','TAW #74, in simple words'],['Good scores come from lots of good shots, one after another.','S1 67:24, in simple words'],['Keep the same routine next time.','S1 73:43, in simple words']]},
 solid:{kicker:'Solid shoot 👍',title:'{score} on {round}',intro:'Right around your usual of {usual}. Steady shooting builds big scores.',introCite:'',
  lines:[['Pick one thing you control next time (setup, tempo or follow-through) and give yourself a 👍 each end you do it.',''],['Compare across months, not one day.','S1 147:11, in simple words']]},
 tough:{kicker:'Comeback plan',title:'Tough day? Totally normal.',intro:'{score} on {round} was {diff} below your usual of {usual}. Even the best archers have days like that. Let\'s rebuild with some easy wins:',introCite:'',
  steps:[['<b>Move closer or use a bigger face</b> for 3 ends. Aim to get 2 out of 3 arrows in the gold (X, 10 or 9). Smooth shots matter more than Xs.','S2 08:50, TAW #116'],
   ['<b>Walk back</b> a couple of metres at a time. Only move once it feels easy.','TAW #116, #138'],
   ['<b>Between ends</b>, replay your best shot in your head.','S1 108:41, TAW #96'],
   ['<b>Pick one thing you control</b>, like your shot routine or follow-through, and give yourself a 👍 for each end where you did it.','']],
  lines:[['Confidence grows from success, so set up some easy wins first.','S1 147:11'],['Tricky days still count. Look at months, not one day.','S1 147:11, in simple words']]},
 incomplete:{kicker:'Round not finished',title:'{round} on {date}',intro:'This round wasn\'t completed, so it isn\'t counted in your PBs or charts. That\'s OK.',introCite:'',
  lines:[['Something feels off? Come down, relax, and draw again.','S1 44:15, in simple words'],['If you stopped because of a sore body, tell your coach or parent.','']]},
 first:{kicker:'First one logged',title:'{score} on {round}',intro:'This is your first score on this round, so it\'s your PB to beat next time!',introCite:'',lines:[['Which shot felt the best? Tell someone about it.','TAW #74, in simple words']]}
};
