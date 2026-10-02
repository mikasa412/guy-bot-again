## v0.8 - the big simplifier
added:
- new command! /suggest takes a reaction of your own making and sends it off to bot hq - when they make a decision you get notified
- because I thought it was funny there's a 1 in 200 chance the bot sends a typing indicator and nothing else when you ping it
changed:
- readme is more readable
- made /dmme easier to use
- the bot now knows when it can't respond to pings
- connect4's file is now called connecy4
- fixed the mod buttons on reported bottles working in a really backwards way
removed:
- axed reply window, everywhere uses cache window
- removed beach.json COMPLETELY...
    - bottle ID moved to config.json
    - cooldowns moved to cooldowns SQL table
    - cache moved to its own table
    - bottles moved to (guess where?) their own table
- removed reactions.json... into a sql table. 
- removed stats.json into another sql table. user stats already moved out but now global stats did too