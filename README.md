fun focused bot - works best in a server! 

mainly built around bottles and reacting, with plans for more in the future.

## 1) bottle features
- beachadd: makes a bottle (with a message you write) and tosses it into the sea (pool of bottles). can be pulled out with the next command.
- beachview: gets a random bottle! (wow) bottle can be liked, replied to, or reported until a day after opening.
- beachstats: stats on how many bottles have been added! plus a few more.

## 2) reactions
- /react & /hushreact: both pull a random reaction and put it in the channel - hushreact displays as a message and not a command so only works in servers
- /8ball takes a(n optional) question input and responds to it with... yeah. 
- in servers, you can ping the bot and have it do both! (default is reacting, needs a question mark somewhere in it to 8ball)
- exclusive to ping messages, you can ping with ? and a list to have it pick an option! (accepts any of `A or B or C`, `A, B, or C` and `A, B or C` with any amount of options)
- replies don't ping (dev hates reply pings and knows a few other people that do too)

## 3) misc
- recs (create and get) - recommend stuff to other people (bunch of fields - ex book, steam game, website...)
- redditcares - send a dm to anyone (in the server) with the reddit care resources thing. note bot cannot go around dm settings so "friends only" or just blocking the bot will stop the receiver from getting these.
- connect4! this took a stupid amount of time but it was worth it. the field is for the person you want to play against - leave blank for open challenge.
- a stats system! /stats to view your stats or someone else's, and there's a /leaderboard for a few of them.
    - currently the tracked stats are (* means it has a leaderboard): reacts, 8balls, *redditcares, recs created, *bottles thrown, *bottle likes, connect 4 W/L/D record
- utility commands:
    - /dmme - dms the dev! woah (the optional second field is for the dev to reply back don't use it)
    - ping - every bot has it, nothing special about this one
    - changelog - shows what happened last update, if I remember to put that into the command.
    - info - shows this message. hi!