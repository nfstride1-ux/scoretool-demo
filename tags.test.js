const {tagsOf}=require('./tags.js');const a=require('assert');
const n=t=>tagsOf(t).map(x=>x[1]);
const cases=[
['I shot well. I was holding well on the target and felt good',[]],
['shot nicely, showed good form, the target was clean',[]],
['Wanted to rest, chose to shoot. Felt rested and steady. Shakespeare. Painted arrows. Gearing up for nationals',[]],
['Very windy today, gusty from the left',['Wind/weather']],
['it was raining and cold',['Wind/weather']],
['sun glare on the boss',['Wind/weather']],
['felt tired, bad sleep',['Tired']],
['really nervous, hands shaking',['Nerves']],
['new arrows this week',['Gear change']],
['shoulder sore',['Injury']],
["didn't finish the round",['Incomplete']],
['hot and windy, tired and sore, new sight',['Tired','Wind/weather','Gear change','Injury']],
];
for(const[t,e]of cases)a.deepStrictEqual(n(t),e,t);
console.log('tags: '+cases.length+' cases ok');
