## Circuit - Get paid for your attention

Circuit is a full stack app, designed to be deployed on Farcaster as a miniapp

It allows a Facaster user to pay out to users who interact with their casts, with a strict filter on payouts.

Attention is the most valuable resource on the internet, and tipping while giving attention is backwards.

It is now defunct and open source, as Noice also did this and already have a large user base.

#### Backend
A node websocket server enabling users to configure tip settings.  Uses a Redis cache backed by a Postgres DB to store data quickly for the webhook server to process when a user interacts with an author's post.

#### Frontend
A React.js interface enabling users to configure tip settings.  Doubles as a Farcaster Miniapp

