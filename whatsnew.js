/* What's new (23 Oct 2026). Release notes people can see: Me > Settings & help > What's new, plus a small one-time card on Home
   after an update. Newest first. Every note comes from a real commit (c = the commit it describes).
   To add a release: put a new entry at the TOP with v = the version written to version.json by tools/build_sw.py.
   The Home card shows once when WHATSNEW[0].v is newer than the one this phone has seen (key scoretool.whatsnew.seen). */
window.WHATSNEW=[
  {v:'v2026-10-27-1045-lgnext',d:'2026-10-27',items:[
   ['people',"League scoring: you press Next","On the league scoring page, when a group shares one phone, the card no longer jumps to the next archer the moment you tap the third arrow. It stays on that archer with their three arrows showing and a big Next button. Check the arrows, then tap Next to move to the next archer, in the same order as before. After the last archer, Next goes round to the first archer for the next end. Undo still takes back the last arrow, including the third. Also fixed: with the target hidden on your own phone, the page no longer jumps when you tap the first arrow of an end or Undo, so it stays where you are, as it does with the target showing. Casual, league scoring rules and saved scores are unchanged.",'this release']]},
  {v:'v2026-10-27-0815-lgpage',d:'2026-10-27',items:[
   ['people',"League scoring opens on its own page","In a league week, tap Score my week or Score group and the scoring now opens on its own page, laid out like Casual scoring: the archer chips, the score buttons, Undo and a Scores table for the group. Tap Back to league (at the top or the bottom) to return to the league screen, which stays as you left it, including the one phone or own phones choice. If you are scoring only yourself you can still plot your arrows on the target face, or hide it and tap the scores. Archers still move on to the next one after three arrows. League scoring rules, the 10 archer limit and saved scores are unchanged.",'e08c3cf']]},
  {v:'v2026-10-26-2235-lgscroll',d:'2026-10-26',items:[
   ['people',"League scoring no longer jumps to the top","When you score a group on one phone in a league week, the page used to jump back to the top after every arrow. It now stays where you are, so the score buttons and the sheet stay on screen. Only choosing a different archer (or opening or leaving the week) starts at the top. Scoring and saved scores are unchanged.",'ea09434']]},
  {v:'v2026-10-26-2145-leslie',d:'2026-10-26',items:[
   ['people',"Move an archer between phones any time","In a league week the host can now move an archer who has already started between Own phone and Phone 1, 2 or 3, and back. The ends already scored stay exactly as they are and scoring carries on from the next end. Before, a started archer's buttons were greyed out.",'a3cd686']]},
  {v:'v2026-10-26-2106-nopreset',d:'2026-10-26',items:[
   ['trophy',"Onion Shed Challenge league removed","The preset Onion Shed Challenge league is no longer added to anyone's Leagues list, and one already on a phone is no longer listed. Nothing saved was deleted or changed: its scores and sessions are exactly as they were. Creating a new league, weekly scoring, the relay and the shoot-up all work as before. In New league, the Use the usual group button ticks the same members as before as a starting point.",'a639320']]},
  {v:'v2026-10-26-2027-chipcolors',d:'2026-10-26',items:[
   ['target',"Light theme: score chips and archer names are readable","On Casual and League score cards, and on Vegas match play, the arrows you have just shot (X 10 9 8 7) were dark navy with dark text in the light theme, so you could not read the scores. They are now light chips with dark text, and the archer name pills are light too. The dark theme looks the same as before. Nothing saved has changed.",'1c75ce3']]},
  {v:'v2026-10-26-1955-ghosttie',d:'2026-10-26',items:[
   ['target',"Ghost match: a tied end is readable again","On the Ghost match panel, an end where you tied the ghost (for example 30 against 30 on Vegas 300) was drawn in white text on a white card in the light theme, so it looked like an empty end. It now shows in the normal text colour, the same as the Ghost row, and the gap figure on the ghost bar does the same when you are level. Your scores were never missing and nothing saved has changed.",'c1072bd']]},
  {v:'v2026-10-26-1946-vgtab',d:'2026-10-26',items:[
   ['target',"Vegas 300: the Ends so far card is gone","The Ends so far card that sat under Back and Next while you scored Vegas 300 and Vegas 300 (18 m) has been removed. Nothing else on the Vegas scoring screen changed, and the scorecard screen still shows every end. Your saved scores are not changed.",'f0f9d07']]},
  {v:'v2026-10-26-1843-undozoom',d:'2026-10-26',items:[
   ['target',"Indoor faces: Undo, zoom and the End box fixed","On an indoor round with the 3-spot face (Just me, League and Casual), Undo now takes back the arrow you just shot, with its plotted marker, even after the end has sorted itself high to low. Before, a finished end put its arrows in score order, so Undo could remove the lowest score instead of the arrow you had just shot and leave a marker on the target that no longer matched the arrow list. Zoom now clears when the next end opens, when you come back from the sheet, and when you change spot, so you always start on the full face and zoom in only if you want to. The End box on the right shows the running total of the end on screen (0 on a new empty end), and Prog is the total through that end. Your saved scores and positions are not changed.",'c2a35af']]},
  {v:'v2026-10-26-1756-ghostpick',d:'2026-10-26',items:[
   ['ghost',"Ghost match: pick who to race, and it works again on Australian Indoor 18m","The ghost box was greyed out on Australian Indoor 18m even when you had scored it before. It now unlocks whenever you have any past score of that round: part-shot rounds, rounds on a different face (3-spot or single) and your competition results all count. If the ghost was shot on a different face from yours, a note says so. There is a new Choose who list: any past score with its date and score (your PB and best marked), your PB, your average, and the world or national record for that round. A record only has a total, so it races as an even pace line and says so. Where no record is confirmed it says Record not available (the World Archery 18 m records are listed; no Australian record figures could be confirmed yet). The records live in one small file, data/records.json, with sources. Your saved scores are not changed.",'068b45c']]},
  {v:'v2026-10-26-1732-indoorparity',d:'2026-10-26',items:[
   ['target',"League and Casual indoor scoring now work like Just me","League weeks and Casual shoots on an indoor round (Onion Shed Challenge, Vegas 300 and Australian Indoor 18m) now score exactly like Just me when you are the only archer on the phone. The 3-spot face is plotted with each arrow measured from its own spot, the X 10 9 8 7 6 M buttons give the same values, and a full end of 3 is put in order (X first, then highest). You get the End and Prog boxes, your arrows as tappable chips (tap one to fix it, or delete it), Undo, and the table of ends with a total each end. The face and the score buttons fit on the phone screen together and stay put after each tap. Your League scores are saved as a session with the plotted arrows, so your groups and heatmaps include them, and the analysis (round summary, where the shoot landed, sight move guide) shows straight under your score when you finish. Old scores load as before: nothing saved was changed, and only plot positions are added. Scores sent to other phones in the league are still the end scores only, no plot positions. Fixing or deleting an arrow works on the end you are shooting; an earlier end is changed with Undo. Fair play checks still only apply to Just me practice.",'c1a513a']]},
  {v:'v2026-10-26-1727-adminback2',d:'2026-10-26',items:[
   ['check',"Viewing another tester: Back to my profile","When you switch to another tester to take a look, a navy and gold bar now stays under the top bar on every screen: Viewing as Nate, with a Back to my profile button. One tap takes you back to your own profile. The switch card in Me stays too, and opening your link with ?tester=nathe always works as a way back. Looking at another tester is read only: nothing is saved on their profile, nothing is sent from it, and if you try to score or save you see a notice that it was not saved. Normal testers never see the switcher.",'e0a11de']]},
  {v:'v2026-10-25-1451-pgcomp',d:'2026-10-25',items:[
   ['clip',"Peel group card: Competition complete","Peel is two days. After Day 1 or after Day 2, tap Competition complete on the group card. It merges Day 1 and Day 2 for each archer (each half, each day total and the overall total) into a separate results record, shows the results table, and lets you share each archer's full competition sheet with their own name on it, plus one combined results summary. If only one day has been scored it says one day only. Your saved Day 1 and Day 2 scores are not changed. The Start Day 3 button is gone once two days exist.",'4348def']]},
  {v:'v2026-10-25-1440-pgshare',d:'2026-10-25',items:[
   ['check',"Peel group card: each archer's own name when sharing","Sharing an archer's sheet from the group card now puts that archer's own name on the picture, in the share title and message, and in the file name. It used to show the name of the phone's owner on every archer's sheet. A junior named on the card still shows by nickname only. The sheet view also showed the share button twice: the gold Share score sheet button inside the sheet is gone and the blue Share sheet button below it is the one to use. Scores, saved days and names are exactly as they were.",'77b7262']]},
  {v:'v2026-10-25-1434-pgscroll',d:'2026-10-25',items:[
   ['clip','Peel group card: score buttons and sheet stay together',"After you tap a score the card no longer jumps back to the top. The archer's name, the score buttons and the updated sheet now stay in view together, and the big Next button sits at the bottom of the sheet (below the grid, above the totals). Tap Next to move on to the next archer. The card lines up the same way after every tap, so nothing flicks between taps. Scores, saved days and names are exactly as they were.",'d1d963d']]},
  {v:'v2026-10-25-0559-glyphicons',d:'2026-10-25',items:[
   ['check','Ticks, stars and crosses are now line icons',"The plain text tick, star and cross marks in the app (for example Saved, Copied, verified, new PB, Exit round, Delete arrow and the selected option on the Score tab) are now drawn as the same small navy and gold line icons as the rest of the app, in light and dark. This only changes how they look. Your scores, saved rounds and names are exactly as they were.",'33af300']]},
  {v:'v2026-10-25-0048-peelsave',d:'2026-10-25',items:[
   ['clip','Peel group card: Saved only when it is true',"If you tap Save on a day and then undo a target and score it again with a different result, the card used to keep saying Saved with the old totals. It now says the scores changed and the Save button comes back, so you tap it to update the saved copy. If the scores are the same as when you saved, it still says Saved. It also now says where to find a saved day: under Clubs, Group score card (it said the Score tab before).",'9cedf4a'],
   ['bars','Analytics round list matches Stats',"The round list in Analytics now sits in the same order as the Stats round picker, and shows the same label for results entered under the event's own round name (Field Red). Nothing about your scores changed.",'9cedf4a']]},
 {v:'v2026-10-25-0006-calfix',d:'2026-10-25',items:[
  ['calendar','Calendar card no longer covers the target',"The small card asking to add your finished scores to your Archery Calendar could pop up over the target face while you were scoring a casual shoot or a league week. It now waits until you are not scoring. It still shows only once, and you can ignore it.",'f61bc38'],
  ['check','Squad activity wording',"Under a squad member's official result it now says verified, official result (it named another website before). Nothing else about the result changed.",'f61bc38']]},
 {v:'v2026-10-24-2351-csvcomma',d:'2026-10-24',items:[
  ['bow','Load CSV: decimal commas',"Load PDF or CSV now reads a spreadsheet CSV that uses semicolons between columns and a comma as the decimal point, which is how a spreadsheet saves it in many countries. Before, a mark like 18,5 was split in two and loaded as 18 and 5. Now it loads as 18.5. A comma-separated CSV with the mark in quotes, like \"18,5\", works too. Files that already worked load exactly as before.",'a0b07ac']]},
 {v:'v2026-10-24-1917-abanext',d:'2026-10-24',items:[
  ['clip','Peel group card: sheet and Next button',"On the State Titles group card, the full score sheet of the archer you are scoring now sits under the score buttons, the same sheet as the ABA scorer: every target with its score and running total, the block totals, both halves and the round total. After the last arrow of a target the card stays on that archer, showing their updated sheet, until you tap the big Next button, which names the archer who is up next. Undo still works while it is waiting and takes the last target back, and the Sheet button for each archer is still there. If you close the app while it is waiting, it is still waiting when you come back.",'50bc2a6'],
  ['clip','Peel group card: Save the day',"When every target is scored for every archer, a Save button appears. Tap it to keep a final copy of that day's scores for the whole group. It tells you in plain words that the scores are saved and where to find them: on this phone, under Clubs, Group score card, ABA State Titles at Peel, Day 1 or Day 2, Open. Tapping Save again just refreshes the same record, so nothing is doubled. Scores were already saved after every target, so nothing is lost if you never tap it. Nothing is added to anyone's own rounds or stats.",'50bc2a6']]},
 {v:'v2026-10-24-1024-facecard',d:'2026-10-24',items:[
  ['target','Target face when you score only yourself',"In a casual shoot or a league, if you are the only archer you are scoring on your phone, you now get the same target face as Just me. Tap where each arrow landed (or hold to aim with the magnifier), use the zoom, and pick a spot on 3-spot faces. Indoor, outdoor and field faces all work, and the score buttons are still there. Where your arrows landed is saved with your session, so your groups and heatmap pick them up. When two or more archers are scored on one phone, 3D and ABA stay buttons only. Your saved scores are not changed.",'9f5f225']]},
 {v:'v2026-10-24-1019-abasheet',d:'2026-10-24',items:[
  ['target','ABA sheet so far, target by target',"The casual 3D ABA card now shows the same full sheet as the Just me ABA scorer, under the score buttons and on screen the whole shoot. Every target has its own row with the score and the running total for its 10 targets, with the block total under each 10, both half totals, the round total, and your count of 20s and 18s. The target you are on is marked. When the shoot is finished the Totals card shows the same sheet for each archer. It is display only, so your saved scores and totals are not changed.",'4665ec5']]},
 {v:'v2026-10-24-0946-abatotals',d:'2026-10-24',items:[
  ['target','ABA totals on the card',"The casual 3D ABA card now shows the same running totals as the Just me ABA scorer: your total, the most you can still score, each half with its 10-target blocks, and your last target with the running total for its block. When the shoot is done the same totals show under the scores. Your saved scores are not changed.",'b6bf74e']]},
 {v:'v2026-10-24-0939-abafix',d:'2026-10-24',items:[
  ['target','3D ABA scoring, one arrow at a time',"In a casual 3D shoot with the ABA 3-arrow and 1-arrow rounds (for example State Titles day one: 40 targets 3-arrow, then 40 targets 1-arrow), the card now works like the Just me ABA scorer. It shows the half and the target number, then Arrow 1 with 20, 18, 16 and Miss. Tap Miss and it moves to arrow 2 (14, 12, 10), then arrow 3 (8, 6, 4). The first arrow to score counts. Undo steps back one arrow, then one target. Totals and the 20s and 18s counts are the same as before, and your saved scores are not changed.",'6ab79ad']]},
 {v:'v2026-10-24-0815-sightcard2',d:'2026-10-24',items:[
  ['card','New sight card design',"The printed sight card now looks like a business card: the Archery Calendar header with a gold line, then your marks on the front and your bow settings on the back. Same size, same printing: 100% (Actual size), double-sided.",'6951fa1']]},
 {v:'v2026-10-24-0750-sightcard',d:'2026-10-24',items:[
  ['card','Print a sight card',"In Sight marks, tap Print sight card. Pick the distances (5 to 60 m to start) and get an A4 PDF with two credit-card-size cards: your marks on the front, your bow and arrow settings on the back. Print at 100% (Actual size), double-sided, cut on the corner marks and laminate.",'2fd0b42']]},
 {v:'v2026-10-24-0545-calmine',d:'2026-10-24',items:[
  ['calendar','Calendar opens My events',"The Calendar tile on Home now opens your My events on archerycalendars.com, so you see your own calendar straight away. Sign in there if it asks.",'8eb05bd']]},
 {v:'v2026-10-23-1735-arrowcheck',d:'2026-10-23',items:[
  ['arrow','Save calculator results to an arrow',"Pick an arrow in the speed or FOC calculator and tap Save to this arrow. It keeps the FOC, total weight, speed, the bow and the date on that arrow, and My arrows shows them. Your shaft, spine, length and points are only changed if you changed them in the calculator and say yes.",'54ca35c'],
  ['check','Is this arrow right?',"After the calculators, a plain-words check: FOC too low, good or high for indoor, outdoor target, field, 3D or hunting, and spine too stiff, about right or too weak from the maker's chart for your bow. It shows the range it used and the source. It is a guide: confirm it by bare-shaft or paper tuning.",'54ca35c']]},
 {v:'v2026-10-23-1533-ausindoor',d:'2026-10-23',items:[
  ['target','Australian Indoor 18m',"The 30-arrow Australian Indoor round is in the round list. Pick the face before you start: vertical 3-spot (the traffic light), triangular 3-spot or the single 40cm face. It is the same round whichever face you shoot, so your PBs and averages stay together. Works in Just me, Casual shoots and head-to-head.",'3a1ec58'],
  ['check','Plotting on the traffic light',"Arrows plotted on the vertical 3-spot are measured from the spot they hit, so the plot, group patterns and your scores all agree. Older sessions are not changed.",'3a1ec58']]},
 {v:'v2026-10-23-1447-sweep',d:'2026-10-23',items:[
  ['target','3-spot groups fixed',"Group patterns, the arrow plot and the end-of-shoot view now measure every 3-spot arrow from the spot it was shot at, then overlay them on one spot. A tight Vegas round now shows as a tight group in the gold. Your arrows are not changed.",'148a6a6'],
  ['target','Arrow plot',"Analytics shows a real dot for each plotted arrow on the right face, with soft shading, your group centre and a sight guide in mm.",'ea202d1'],
  ['bars','This shoot vs your usual',"Under your score at the end of a round: score vs your average and PB, score by end, Xs and 10s, and your plot vs your usual group for the same round. Open in Past sessions shows the same view.",'9e65b26'],
  ['check','Finish session',"A clear Finish session button closes the round. Your arrows were already saved as you went, so nothing is saved twice.",'9e65b26'],
  ['arrow',"Today's arrows","Tap the number to edit it in place. Set, +/- and Reset no longer jump to Home.",'8c18895'],
  ['check','Small fixes',"Parent view Preview has a back button, and saving your display name keeps the Profile back button.",'91821d0']]},
 {v:'v2026-10-23-1341-brand',d:'2026-10-23',items:[
  ['check','Plainer wording',"Screens now call your official scores past competition results. Your scores and settings are not changed.",'36c0212'],
  ['globe','Apps I use',"Apps I use no longer suggests example apps. Add the links you use with Paste link or Find in store.",'36c0212']]},
 {v:'v2026-10-23-1333-sightest',d:'2026-10-23',items:[
  ['target','Estimate other marks',"In Setups & sight marks, tap Estimate other marks once you have 3 or more marks. Empty distances show an estimate marked est. Confirm each one on the range.",'957373b'],
  ['check','Your marks stay yours',"Estimates never change a mark you typed. Type over an estimate to make it your own mark, or tap Clear estimates to remove them all.",'957373b']]},
 {v:'v2026-10-23-1324-arrowpick',d:'2026-10-23',items:[
  ['arrow','Pick from My arrows',"The Calculators, the Arrow chooser and the Arrow optimizer each have a My arrows choice. Pick a set to fill in its length, weights and balance point. You can still change any box.",'f81fa58'],
  ['target','Arrow set in tuning sessions',"A new tuning session can save the arrow set you pick, so you can see later what you shot. Old sessions are not changed.",'f81fa58']]},
 {v:'v2026-10-23-1316-myarrows',d:'2026-10-23',items:[
  ['arrow','My arrows',"My archery now has My arrows. Add each arrow set once: shaft, spine, length, point and total weight, and fletching. Your sets with sight marks are already there.",'88b86f9'],
  ['calc','FOC for each arrow set',"Add the part weights, or a measured balance point, and My arrows works out FOC with the same Easton formula as the Arrow chooser.",'88b86f9'],
  ['target','One list for sight marks',"The Arrow set choice in Setups & sight marks is the same list as My arrows.",'88b86f9']]},
 {v:'v2026-10-23-1312-loadpdf',d:'2026-10-23',items:[
  ['clip','Load PDF or CSV',"The sight marks button is now Load PDF or CSV. It reads any sheet with a column of ranges and a column of marks, and you can still paste marks.",'952cb79']]},
 {v:'v2026-10-23-1222-sightimport',d:'2026-10-23',items:[
  ['clip','Import sight marks',"In Setups & sight marks, tap Load PDF or CSV. Load a PDF or CSV with range and mark columns, or paste your marks. It works offline.",'52c7493'],
  ['check','Check before saving',"A preview shows every distance first. Your own marks are kept unless you choose Replace existing marks, and it asks before replacing.",'52c7493']]},
 {v:'v2026-10-23-1216-aceseed',d:'2026-10-23',items:[
  ['bow','Full sight mark sheets',"Sight marks now show every distance you have a mark for, even 2 m to 120 m. Long lists scroll, with the headings kept at the top.",'0485eec'],
  ['gear','More arrow set details',"Arrow details also hold total weight, speed, sight height, sight radius and the distances you sighted in at.",'0485eec'],
  ['check','Setup screen keeps its place',"Changing the bow setup or arrow set in Setups & sight marks stays on that screen, with the back button.",'0485eec']]},
 {v:'v2026-10-23-1145-arrowsets',d:'2026-10-23',items:[
  ['bow','Sight marks for each arrow set',"In Sight marks, pick an Arrow set as well as the bow setup. Each set has its own marks. Your marks from before are under Arrows 1, unchanged.",'cd136d5'],
  ['gear','Arrow set details',"Save the shaft, spine, length and point for each set, or fill them from the Arrow chooser.",'cd136d5']]},
 {v:'v2026-10-23-1140-arrowuse',d:'2026-10-23',items:[
  ['bow','Arrow chooser by use',"Pick Target, Indoor, Field, 3D or Hunting. Indoor lists fat shafts only, like SuperDrive 23 and X23. Hunting uses Easton's hunting chart.",'f8ef253'],
  ['search','Result at the bottom',"Fill in from the top down. The result sits under everything it uses, and shows how the chart weight was worked out.",'f8ef253'],
  ['book','Dr James Park notes',"What his research says about spine and shaft choice, with sources. The spine numbers still come from the makers' charts.",'f8ef253']]},
 {v:'v2026-10-23-1000-whatsnew',d:'2026-10-23',items:[
  ['bell',"What's new","This page. After each update a short note shows once on Home.",'8463cdd'],
  ['book','Help guides rebuilt',"New guides for the new layout. They follow light or dark mode and print on white.",'8463cdd']]},
 {v:'v2026-10-23-0915-photos',d:'2026-10-23',items:[
  ['camera','Score photos',"After you finish a round you can add a photo, or tap Skip. Change or remove it later in Past sessions. Photos are made small and kept on your phone.",'959ac11'],
  ['calendar','Send past rounds to Archery Calendar',"Rounds finished before you linked now have a Send button in Past sessions. Pick the right event, or None of these.",'3465077'],
  ['target','Arrow counts in round lists',"Round pickers show how many arrows each round has, like 72 arrows.",'4948a08'],
  ['bars','How far an unfinished round got',"Past sessions shows progress beside Incomplete, like 6 of 12 ends.",'4948a08'],
  ['ghost','Ghost match icon',"Ghost match has its own line icon.",'4948a08'],
  ['check','My rounds buttons fixed',"Start, Edit and Delete in My rounds always work, and the card only shows under Just me.",'9afb505 6050980'],
  ['bow','Casual shoot: 3D',"Casual shoot has a 3D choice: ABA, IBO and ASA scoring, with the number of targets you pick.",'3ba9958'],
  ['flag','Events on score sheets',"Tie a score to an Archery Calendar event. The event name heads the score sheet.",'31af716']]},
 {v:'v2026-10-22-2215-mybows-all',d:'2026-10-22',items:[
  ['home','New layout',"Home, Score, My archery, Clubs and Tools. Me is at the top. Finish later keeps a round for another time.",'edd2d9a'],
  ['check','Back buttons',"Every inner screen has a Back button, and the phone's own back works too.",'edd2d9a'],
  ['sun','Light or dark',"Switch in Me > Settings & help, or with the target-face button at the top.",'edd2d9a 010ddb2'],
  ['star','Line icons',"Simple navy and gold icons replace emoji.",'65c1109'],
  ['bow','My bows',"Add your bow's make, model and specs from a list of 245 bows from the makers' own pages.",'6550cbf 9696d94'],
  ['search','Arrow chooser',"Tools > Arrow chooser gives a starting spine and cut length from the makers' charts.",'e2a5cbe'],
  ['book','Rules',"Tools > Rules has World Archery, Archery Australia, ABA, IBO and ASA, with sources.",'733638d'],
  ['trend','Full analysis follows your pick',"End by end and Half split use the shoot you pick in Personal bests.",'0b77a71 3781099'],
  ['clip','Peel State Titles: Day 1 and Day 2',"The group score card shows both days and an event total.",'358890c'],
  ['target','Tuning arrows count',"Arrows plotted in the Arrow optimizer count toward the day's arrows.",'b8c67e0'],
  ['check','iPhone tab bar',"The tab bar sits right at the bottom in the iPhone home-screen app.",'010ddb2 9e6d102']]},
 {v:'v2026-10-21-1735-casual-shoot',d:'2026-10-21',items:[
  ['people','Casual shoot',"Score tab: Just me, Casual shoot or League shoot. A casual shoot is a one-off group shoot for 1 to 10 people, with match play if you want it.",'8fa9cc2']]},
 {v:'v2026-10-20-1830-offline',d:'2026-10-20',items:[
  ['globe','Works offline',"The app opens and scores with no signal. It catches up when you are back online.",'a0aaf00'],
  ['trophy','Leagues and shoot-ups',"Onion Shed Challenge league: six 300 rounds at 18 m, then a shoot-up final.",'971b79b 37c3276'],
  ['swords','Match night',"Head-to-head with up to 10 archers, each on their own phone.",'0e6ea9b df27f5a'],
  ['clip','Group score card',"Score your whole group on one phone at the Peel State Titles.",'e5eea68'],
  ['card','Display names',"Pick a nickname. It shows in squads, leagues and matches.",'adf7a84']]},
 {v:'v2026-10-18-1936-colourblind',d:'2026-10-18',items:[
  ['gear','Colour-blind safe mode',"A Settings tick for red-green safe colours: white marks, numbered arrow dots, blue and orange.",'81b7c78'],
  ['bulb','Side hill tip',"A tip card for field and 3D rounds on the Score screen.",'b956191'],
  ['up','Share your score sheet',"Share a score sheet as a picture.",'f06ab36'],
  ['bars','Stats redesign',"One round picker, four main cards and More detail, in plain words.",'cd86e07']]},
 {v:'v2026-10-17',d:'2026-10-17',items:[
  ['search','Zoom button',"One small button on the target: Z1, Z2, then Reset. Pinch still works.",'43dba93'],
  ['medal','My best scores',"Your best full round for each round, end by end, from your past competition results.",'7c03766'],
  ['ghost','Ghost match',"Shoot against a past score, end by end, or against top-ranked archers.",'be54eb3 c46826e']]}
];
(function(){
const KEY='scoretool.whatsnew.seen';
const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=n=>(window.icon&&icon(n))||(window.icon&&icon('dot'))||'';
const fmt=d=>{const [y,m,x]=d.split('-').map(Number);return new Date(y,m-1,x).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'})};
const L=()=>window.WHATSNEW||[];
const seen=()=>{try{return localStorage.getItem(KEY)||''}catch(e){return''}};
const markSeen=()=>{try{if(L()[0])localStorage.setItem(KEY,L()[0].v)}catch(e){}};
window.wnMarkSeen=markSeen;
function wnView(){markSeen();shownNow=false;const days=[];L().forEach(e=>{const g=days.find(x=>x.d==e.d);if(g)g.items.push(...e.items);else days.push({d:e.d,items:[...e.items]})});
 app.innerHTML=`<div class="card wnhead"><span class="kicker">Release notes</span><h2>What's new in ScoreTool</h2><p class="small muted" style="margin:0">Newest first. Short notes on each update.</p></div>
 ${days.map(g=>`<section class="card wnday"><h3 class="wndate">${h(fmt(g.d))}</h3><ul class="wnlist">${g.items.map(([i,t,s])=>`<li><span class="wnic" aria-hidden="true">${ic(i)}</span><span><b>${h(t)}</b><small>${h(s)}</small></span></li>`).join('')}</ul></section>`).join('')}
 <div class="card"><button class="btn ghost full" data-go="help">${ic('book')} Help guides</button></div>`;
 app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go))}
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{whatsnew:wnView});
/* one-time card on Home after an update; never while a round is being scored */
let shownNow=false;
function maybeCard(){try{
 if(typeof TESTER=='undefined'||!TESTER||typeof S=='undefined'||!S.unlocked||!S.profile)return;
 if(/^#(share|coach)=/.test(location.hash))return;const tabs=document.getElementById('tabs');if(tabs&&tabs.hidden)return;
 if(typeof cur!='undefined'&&cur)return;if(currentView()!='home')return;
 const top=L()[0];if(!top||(!shownNow&&seen()==top.v))return;if(document.getElementById('wncard'))return;
 if(!shownNow){shownNow=true;markSeen()}
 const items=top.items.slice(0,3).map(x=>x[1]);
 app.insertAdjacentHTML('afterbegin',`<div class="card wncard" id="wncard" role="status"><span class="wnic" aria-hidden="true">${ic('bell')}</span><div class="wntx"><b>Updated: what's new</b><small>${h(items.join(' · '))}</small><button class="btn ghost" id="wnopen">See what's new</button></div><button class="wnx" id="wnx" aria-label="Dismiss what's new">${ic('cross')}</button></div>`);
 document.getElementById('wnopen').onclick=()=>{shownNow=false;nav('whatsnew')};
 document.getElementById('wnx').onclick=()=>{shownNow=false;const c=document.getElementById('wncard');if(c)c.remove()};
}catch(e){}}
function currentView(){try{return view}catch(e){return null}}
window.wnMaybeCard=maybeCard;
let q=false;const watch=()=>{const a=document.getElementById('app');if(!a)return;new MutationObserver(()=>{if(q)return;q=true;queueMicrotask(()=>{q=false;maybeCard()})}).observe(a,{childList:true})};
if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',()=>{watch();maybeCard()});else{watch();setTimeout(maybeCard,0)}
})();
