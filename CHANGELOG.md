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