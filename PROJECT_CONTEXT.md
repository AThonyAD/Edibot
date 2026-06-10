# Project Context

## Project

Edibot is a B2B communication opportunity database.

The product helps companies, PR agencies, media agencies, marketing teams, HR teams, and management teams find relevant places where they can communicate a business topic, brand, campaign, employer message, or sponsorship intent.

The product is not a consumer event discovery app.

## Current Product Direction

Edibot should stay focused on a narrow B2B use case:

- editorial plans and media topics
- commercial supplements
- PR and advertising opportunities
- B2B conferences
- business events
- HR, leadership, and management events
- motivational speakers
- sponsorship opportunities
- webinars
- podcast specials
- newsletter specials
- awards
- trade fairs

The core question Edibot answers is:

> Where can a company communicate a topic such as leadership, AI, wellbeing, vitamins, immunity, employer branding, or a B2B product launch?

The app should return relevant opportunities, not a full media plan.

## Explicitly Out Of Scope

The project will not include a B2C event discovery application of the "Next Week In" type in the first phase.

This idea may become a separate product later, but it must not share the primary database or data flows with the B2B product.

The B2B database may contain events only when they have clear business, PR, HR, marketing, or sponsorship relevance for companies.

Edibot should not include:

- ordinary concerts
- tourist events
- leisure trips
- family events
- flights
- hotels
- holiday packages
- ticketing marketplace features
- affiliate feeds
- consumer booking flows

## Side Project Hypothesis: Next Week In

During product exploration, a separate B2C idea emerged: **Next Week In**.

This is a potential future product, not part of Edibot's first phase.

### Working Concept

Next Week In would be a personal time-first discovery app.

It should not be "another list of events". The center of the product would be the user's own time, calendar, interests, and location.

Possible positioning:

> A personal operating system for free time.

Possible product analogy:

- Google Calendar
- Notion
- Eventbrite
- travel and ticketing discovery

But with the main focus on:

- planning
- free time blocks
- recommendations
- adding activities to the calendar
- booking or reserving only when useful

### Core User Question

Next Week In would answer:

> What should I do next week or this weekend, given my calendar, location, interests, and budget?

This is different from classic event discovery products that answer:

> What events exist?

### Target Users

Potential users:

- individuals
- couples
- families
- tourists
- expats

### Possible Data

Next Week In could include:

- leisure events
- concerts
- exhibitions
- food festivals
- sport and outdoor activities
- trips
- last-minute travel offers
- tickets
- flights
- hotels
- booking and affiliate offers

### Possible UI Direction

The strongest UX direction is **time-first UI**.

Instead of opening with an event catalogue, the app would open with the user's week:

- current week calendar
- free time blocks
- recommended activities for each free block
- filters for interests, price, distance, and availability
- one-click add to calendar

Example structure:

```text
Next Week In Prague

My week
- Wednesday 18:00-22:00 free
- Friday 17:00-23:00 free
- Saturday all day free

Recommended for you
- Wine festival nearby
- AI meetup
- Weekend trip
- Exhibition

Discovery filters
- category
- location
- radius
- price
- date
- free calendar slots only
```

### Mobile Direction

On mobile, the app should still be time-first:

- show the next few free slots
- show suggestions directly under each slot
- keep filters compact
- avoid becoming a generic event list

### Why It Should Stay Separate

The side project should stay separate from Edibot because it has a different user, data model, monetization, and operating complexity.

#### Different User

Edibot user:

- plans campaigns
- evaluates communication opportunities
- manages budgets
- needs contacts, deadlines, reach, and B2B relevance

Next Week In user:

- plans evenings, weekends, trips, and free time
- wants personal recommendations and convenience

#### Different Data

Edibot data:

- deadlines
- editorial topics
- reach
- target audiences
- contacts
- sponsorship packages
- business conditions

Next Week In data:

- tickets
- availability
- prices
- reviews
- affiliate links
- flights
- hotels
- weather

#### Different Monetization

Edibot:

- subscription
- paid access
- lead generation
- provider listings
- premium visibility

Next Week In:

- affiliate revenue
- ticketing commissions
- advertising
- marketplace commission

#### Different Operational Burden

Edibot can remain relatively simple:

- database
- login
- roles
- exports
- AI-assisted search

Next Week In would introduce:

- XML imports
- affiliate feeds
- availability checks
- booking flows
- tracking
- consent management
- consumer law
- cancellations
- complaints
- API limits

This complexity would make Edibot harder to build, operate, and explain.

## Product Separation Decision

Edibot and Next Week In should be treated as two separate products.

```text
Product A: Edibot
Audience: B2B
Scope: media, PR, editorial plans, business events, sponsorship, HR/management opportunities
Data: deadlines, contacts, reach, target audiences, packages, sources, opportunities

Product B: Next Week In
Audience: B2C
Scope: personal calendar, leisure events, trips, ticketing, booking, affiliate discovery
Data: events, tickets, availability, affiliate links, travel offers, user calendar
```

The products may share ideas, design lessons, or generic infrastructure patterns in the future, but they should not share the primary operational database or ingestion flows.

## Event Inclusion Rule For Edibot

Events are allowed in Edibot only when they are relevant to company communication or company planning.

Include events such as:

- conferences
- trade fairs
- leadership events
- HR events
- management events
- business networking events
- employer branding events
- sponsored public events with clear brand activation opportunities
- motivational speaker events for companies

Exclude events such as:

- ordinary leisure concerts
- generic public festivals with no B2B offer
- tourist attractions
- weekend trip ideas
- family activities
- consumer ticketing-only listings

When in doubt, ask:

> Would a company reasonably use this as a PR, HR, marketing, sponsorship, employer branding, or business communication opportunity?

If the answer is no, it belongs outside Edibot.

## Opportunity Types For Edibot

Preferred B2B opportunity types:

- media_topic
- editorial_plan
- commercial_supplement
- conference
- business_event
- HR_event
- management_event
- motivational_speaker
- sponsorship_opportunity
- webinar
- podcast_special
- newsletter_special
- award
- trade_fair

Avoid broad consumer categories in the primary B2B taxonomy unless they are explicitly connected to a business opportunity.

## Future Revisit Notes

If returning to Next Week In later, start from these questions:

1. What city or region should be the first market?
2. Should the product start from calendar integration or from manual free-time input?
3. Which supply source is realistic first: curated events, ticketing APIs, affiliate feeds, or manual editorial selection?
4. What is the first monetization path: ticketing affiliate, travel affiliate, paid curation, or local advertising?
5. How much personal data is needed before recommendations become useful?
6. Can the app work as a simple weekly planner before adding bookings and affiliate integrations?

Suggested first MVP for Next Week In:

- one city
- one week view
- manual interests
- manual free-time slots
- curated recommendations
- add to calendar
- no booking flow
- no shared database with Edibot

## Current Decision

For now, Edibot remains the priority.

Next Week In is recorded as a separate product hypothesis and should not expand the Edibot MVP scope.
