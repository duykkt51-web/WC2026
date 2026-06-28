# World Cup 2026 Schedule Data

`matches.json` contains 104 matches.

Source used for the generated schedule:

- https://www.thestatsapi.com/world-cup/data
- https://www.thestatsapi.com/world-cup/data/fixtures.json

Round of 32 teams updated on 2026-06-28 from:

- https://indianexpress.com/article/sports/football/fifa-world-cup-2026-final-round-of-32-schedule-qualified-teams-10760874/
- https://www.moneycontrol.com/sports/football/fifa-world-cup-2026/fifa-world-cup-2026-round-of-32-qualified-teams-complete-fixtures-match-timings-and-dates-in-ist-article-13960356.html

Reference checks:

- FIFA confirms the 2026 FIFA World Cup has 104 matches.
- FIFA confirms the opening match is Mexico vs South Africa at Estadio Azteca, Mexico City.
- FIFA confirms the final is Match 104 at MetLife Stadium, New York / New Jersey.

Time fields:

- `kickoffUtc`: kickoff time in UTC.
- `kickoffVietnam`: kickoff time converted to Vietnam time, UTC+7.

Knockout matches use bracket placeholders such as `Group A Winners` or `Winner Match 101` until the tournament determines the real teams.
