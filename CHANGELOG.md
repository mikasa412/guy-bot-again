## v0.8 - the big simplifier
added:
- new command! /suggest takes a reaction of your own making and sends it off to bot hq - when they make a decision you get notified
- because I thought it was funny there's a 1 in 200 chance the bot sends a typing indicator and nothing else when you ping it
changed:
- readme is more readable
- made /dmme easier to use
- the bot now knows when it can't respond to pings
- fixed the mod buttons on reported bottles working in a really backwards way
- connect4's file is now called connect4
removed:
- axed reply window, everywhere uses cache window
- removed beach.json COMPLETELY...
    - bottle ID moved to config.json
    - cooldowns moved to cooldowns SQL table
    - cache moved to its own table
    - bottles moved to (guess where?) their own table
- removed reactions.json... into a sql table. 
- removed stats.json into another sql table. user stats already moved out but now global stats did too
- all in all the beach code is about 100 lines lighter
- don't use this update - it relies on you knowing the structure of a bunch of tables (you could probably figure the old ones out). 0.9 or the next update brings a solution I have in the works.

v0.7.5 - made a general react() function, updated current reacts to use it

### v0.7.4 - 4 small addons in 1 
- moved /beachfind back to /beachview
- removed old new /beachview 
- removed calls to ^^^ in the handler
- added a choice answer system to the ping handler (requires both "?" and "or")
- added a /info command & a better README for it to source from

## v0.7.0 - bottles part 4 and first game!
- added cache window, which handles like submit times
- reply window now only tracks reply time
- moved /beachview to /beachfind
- /beachview now shows every bottle pulled over the last (cache window) in one message with page display
- also quick likes/replies for in the window
- made a real update page (you're reading it now!) and started retroactively adding older updates to the changelog
- separated changelog from readme file (it's bad for now wtv)
- switched /changelog to show update.md
- added a connect 4 game (and the structure for easily adding more)
- added a variable cooldown system based on how many of the last X bottles were pulled by you
- 4 more variables in the env file (cache window, cooldown base, cooldown factor, max cd tracking)
- added max and min length for all bottles now, not just replies

v0.6.2a - organized 8ball list & added `{ping}` code for bottles

### v0.6.2 - bottles part 3.5
- fixed the bottle draw code
- added 3 codes (`{time}`, `{date}`, and `{name}`) to be used in bottles
    - time is time of drawing
    - date is the date it's drawn
    - name is the person drawing
- added a few chance easter eggs to the bottle embed

### v0.6.1 - afaik making likes work better idfk

## v0.6 - the likes update!
- added a like button to bottles
- fixed a few tpyos from 0.5.8
- added a leaderboard for bottle likes
- added your like count to the stats page

## v0.5.5 the old update
- ivhiwugbhgwbghjrbsgjkgbtvsdbubhb