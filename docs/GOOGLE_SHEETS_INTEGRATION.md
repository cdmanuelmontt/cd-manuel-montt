# Google Sheets Integration Documentation

## Overview

This football club website integrates with Google Sheets to allow easy data management through a familiar spreadsheet interface. Data entered in the Google Sheet is automatically synchronized with the website database.

## Google Sheet Setup

### 1. Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Football Club Data Management"

### 2. Create Required Tabs/Sheets

Your Google Sheet must contain the following tabs (sheets) with the exact names:

- **Teams**
- **Matches** 
- **Standings**
- **Suspended_Players**
- **Gallery**
- **Club_Info**

## Sheet Structure and Data Entry Guidelines

### Teams Sheet

**Purpose:** Manage team information for different series/divisions.

**Columns (in exact order):**
| Column A | Column B | Column C |
|----------|----------|----------|
| id | name | series |

**Data Entry Rules:**
- **id**: Use a unique identifier (e.g., TEAM001, TEAM002)
- **name**: Full team name (e.g., "Manchester United", "Chelsea FC")
- **series**: Competition/division name (e.g., "Premier League", "Division 1")

**Example:**
```
id          name              series
TEAM001     Arsenal FC        Premier League
TEAM002     Chelsea FC        Premier League
TEAM003     Liverpool FC      Premier League
```

### Matches Sheet

**Purpose:** Track match fixtures, results, and schedules.

**Columns (in exact order):**
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | home_team_id | away_team_id | match_date | home_score | away_score | status | series | venue |

**Data Entry Rules:**
- **id**: Unique match identifier (e.g., MATCH001, MATCH002)
- **home_team_id**: Must match an id from the Teams sheet
- **away_team_id**: Must match an id from the Teams sheet
- **match_date**: Format: YYYY-MM-DD HH:MM (e.g., "2024-03-15 15:00")
- **home_score**: Leave empty for scheduled matches, enter number for completed
- **away_score**: Leave empty for scheduled matches, enter number for completed
- **status**: Use one of: "scheduled", "completed", "postponed", "cancelled"
- **series**: Must match series from Teams sheet
- **venue**: Stadium/ground name

**Example:**
```
id        home_team_id  away_team_id  match_date        home_score  away_score  status     series          venue
MATCH001  TEAM001       TEAM002       2024-03-15 15:00  2           1           completed  Premier League  Emirates Stadium
MATCH002  TEAM003       TEAM001       2024-03-22 17:30                          scheduled  Premier League  Anfield
```

### Standings Sheet

**Purpose:** League table positions and statistics.

**Columns (in exact order):**
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | team_id | series | position | matches_played | wins | draws | losses | goals_for | goals_against | points |

**Data Entry Rules:**
- **id**: Unique standing identifier (e.g., STAND001, STAND002)
- **team_id**: Must match an id from the Teams sheet
- **series**: Competition name
- **position**: League position (1, 2, 3, etc.)
- **matches_played**: Number of matches played
- **wins**: Number of wins
- **draws**: Number of draws
- **losses**: Number of losses
- **goals_for**: Goals scored
- **goals_against**: Goals conceded
- **points**: Total points (usually wins×3 + draws×1)

**Example:**
```
id        team_id   series          position  matches_played  wins  draws  losses  goals_for  goals_against  points
STAND001  TEAM001   Premier League  1         10              8     1      1       25         8              25
STAND002  TEAM002   Premier League  2         10              7     2      1       22         10             23
```

### Suspended_Players Sheet

**Purpose:** Track player suspensions and disciplinary actions.

**Columns (in exact order):**
| A | B | C | D | E |
|---|---|---|---|---|
| id | name | series | reason | remaining_matches |

**Data Entry Rules:**
- **id**: Unique suspension identifier (e.g., SUSP001, SUSP002)
- **name**: Full player name
- **series**: Competition where suspension applies
- **reason**: Reason for suspension (e.g., "Red Card", "Accumulation of Yellow Cards")
- **remaining_matches**: Number of matches left to serve

**Example:**
```
id        name             series          reason                      remaining_matches
SUSP001   John Smith       Premier League  Red Card - Serious Foul     2
SUSP002   Mike Johnson     Premier League  Accumulation Yellow Cards   1
```

### Gallery Sheet

**Purpose:** Manage match photos and media content.

**Columns (in exact order):**
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| id | title | description | image_url | match_date | series |

**Data Entry Rules:**
- **id**: Unique gallery identifier (e.g., GAL001, GAL002)
- **title**: Photo title or caption
- **description**: Optional detailed description
- **image_url**: Full URL to the image (must be publicly accessible)
- **match_date**: Date in YYYY-MM-DD format
- **series**: Competition/series name

**Example:**
```
id      title                    description                     image_url                           match_date   series
GAL001  Victory Celebration      Team celebrating 3-1 win       https://example.com/photo1.jpg      2024-03-15   Premier League
GAL002  Pre-Match Training       Squad preparing for big match   https://example.com/photo2.jpg      2024-03-20   Premier League
```

### Club_Info Sheet

**Purpose:** Manage website content sections like About, History, etc.

**Columns (in exact order):**
| A | B | C | D |
|---|---|---|---|
| id | section | title | content |

**Data Entry Rules:**
- **id**: Unique info identifier (e.g., INFO001, INFO002)
- **section**: Section identifier (e.g., "about", "history", "contact")
- **title**: Section title
- **content**: Full content text (can include basic HTML)

**Example:**
```
id       section  title              content
INFO001  about    About Our Club     Founded in 1885, our club has a rich history...
INFO002  history  Club History       Our journey began over a century ago...
```

## Data Synchronization

### How It Works

1. Data is entered into the Google Sheet following the structure above
2. A Google Apps Script or external service monitors the sheet for changes
3. When changes are detected, data is sent to the website's API endpoint
4. The website updates its database with the new information
5. Changes appear on the website immediately

### Important Notes

- **Column Order**: Columns must be in the exact order specified above
- **Data Types**: Follow the data type requirements (numbers, dates, text)
- **Required Fields**: Don't leave required fields empty
- **ID References**: When referencing other sheets (like team_id), ensure the ID exists in the referenced sheet
- **Date Format**: Use YYYY-MM-DD for dates, YYYY-MM-DD HH:MM for date-times
- **URLs**: Image URLs must be publicly accessible

## Troubleshooting

### Common Issues

1. **Data Not Updating on Website**
   - Check that all column headers match exactly
   - Verify data types are correct
   - Ensure no required fields are empty

2. **Team References Not Working**
   - Make sure team IDs in Matches/Standings sheets exist in Teams sheet
   - Check for typos in team IDs

3. **Date Format Errors**
   - Use YYYY-MM-DD format for dates
   - Use 24-hour format for times (15:00 not 3:00 PM)

4. **Images Not Showing**
   - Verify image URLs are publicly accessible
   - Test URLs by opening them in a browser

### Getting Help

If you encounter issues:
1. Check the data format against this documentation
2. Verify all required columns are present
3. Contact the technical administrator for further assistance

## Best Practices

1. **Regular Backups**: Keep backup copies of your data
2. **Consistent Naming**: Use consistent naming patterns for IDs
3. **Data Validation**: Double-check entries before saving
4. **Test Updates**: Make small test changes to verify synchronization
5. **Documentation**: Keep notes of any custom procedures specific to your club

## Example Template

You can create a template with the proper headers and a few example rows to get started. Remember to delete the example data before entering real information.

---

*Last Updated: [Current Date]*
*Version: 1.0*