# World Cup 2026 Schedule Data

`matches.json` contains 104 matches.

Source used for the generated schedule:

- https://www.thestatsapi.com/world-cup/data
- https://www.thestatsapi.com/world-cup/data/fixtures.json

Reference checks:

- FIFA confirms the 2026 FIFA World Cup has 104 matches.
- FIFA confirms the opening match is Mexico vs South Africa at Estadio Azteca, Mexico City.
- FIFA confirms the final is Match 104 at MetLife Stadium, New York / New Jersey.

Time fields:

- `kickoffUtc`: kickoff time in UTC.
- `kickoffVietnam`: kickoff time converted to Vietnam time, UTC+7.

Knockout matches use bracket placeholders such as `Group A Winners` or `Winner Match 101` until the tournament determines the real teams.
