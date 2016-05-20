#Introduction
I'd like to invite you to complete the first round in our interviewing process, which is a coding challenge. There isn't any time limit on this, and you should choose only ONE of the questions below to answer. There isn't a deadline on submitting this either, but please let me know immediately if you have any pending offers or a short timeline that I should know about.

When completing, please keep in mind that your submission should showcase your knowledge of either Javascript or CSS programming, depending on your strength. We'd love for you to see this challenge as an opportunity to showcase your programming skills and because of that, one of our engineers will be diligent in reviewing your code. Also, you are free to build in your own features to show off your abilities (for example a build system, tests, user accounts / cloud storage, in addition to other cool features... the sky is the limit!).

#Instructions for Option 1 _(This is my Chosen Option)_:

Create a mobile web app that allows you create, edit, and view short notes. Notes are just small textual items, like to-do lists.

* Notes should be stored using browser local storage
* The app should be usable on a standard mobile browser

#Submission Instructions

Please provide your program as a zip or tar archive, with an index.html file. Use whatever libraries, documentation, tutorials, or frameworks you consider necessary. This should be a client-side app, with little or no server code. Please include a README that gives us some relevant info about your program. Please spend around four hours on this assignment.

Once complete, you can submit your finished assignment to the link provided at the bottom of this email. Or, if you have any problems with uploading, please feel free to email me directly. Thank you!

Please submit here: http://app.greenhouse.io/tests/2f6bbcb57bc46cd34a5304ccf6adaf0f

# Notes about my efforts
This entire document was written before beginning work. I will use a github repo if you'd be interested in the changes over time.

## 4 Hour Goal
Meet expectations with a touch more pizazz than I think Zenefits would expect.
Please note that the documentation I've written up below is light on the things I feel very confident about achieving and heavy on the things I find complicated to get a sense of the sort of things I find most interesting and challenging.

## 24 Hour Goal
* Show off growth oriented thinking and product innovation
* Show Drain and Faucet understanding pertaining to growth (and pay) walls using gamification techniques
* Show capability around completely hand rolling unique referral systems
    * Ideally, I'd like to unlock any creative thinking surrounding what efforts marketing team members could dream up.
    * Marketing team members should believe that working with me will increase their capabilities and reduce bottle necks surrounding growth oriented goals
* Show off analytic planning and design capabilities focused on enabling quick digestion of new data
    * Marketing team should know that any dashboard is possible and that I am capable of working with the scientists to organize data in meaningful ways
    * Show off my passion for an experiment driven approach so that all efforts are tracked and measured, no matter how small the effort is.
    * Show off understanding about making business oriented decisions using meaningful data

## Timeline
* 4 Hours
  * 45 minutes planning out design and features
  * 30 minutes scratch setup
  * 1-2 hours Markup / CSS
  * 1 hour advanced JS
  * 1 Hour QA
  * 1 Hour deployment

* 24 Hours
  * 2-4 Hours Archiving / Growth Wall Mechanics and Master JSON Storage (Local)
  * 6-8 Hours setting up external storage for me to hit (Keen.io maybe?) as a datawarehouse _(I'm not a full on DB guy but am comfortable operating in Key / Value storage work and hitting API's, so Keen is a good fit for me in this tight turn around, though this won't be close to being bullet proof)_
      * Check status of my referrals
      * Log referral events to be retrieved by personal referral dashboard
      * 4 Hour Project uses this data store to check and see if they have unlocked unlimited use yet
      * 4 Hour Project should prompt for identifiers to store data against
      * Use FullContact API to grab an image for user
  * 4-6 Hours Landing Pages
      * Marketing Landing Promoting "App"
      * Shared Landing personalized by who shared
      * Analytics Setup with a lot of possibilities on how to slice and dice data
  * 1-2 Hours Animations and sound effects
      * Attempt to add in as much gamification "niceties" as possible
  * 3-4 Hours Branding (Graphic River and Theme Forest Templates to save time)
  * 1-2 Hours designing Dashboard
  * 3-4 Hours Setting up Important Analytics to Track and Custom Dashboards using Mixpanel's new JQL (Buffer for extra time here, 2 hours likely, to learn JQL)

#Featureset

## Main 4 Hour Goals Not Required By Instructions

* Pinned top bar
* Auto understanding of Enter Key back to back to create lists
* Reminder Feature through Twilio Referrals
* Loose usage analytics
* Online / Offline Detection

## Growth Marketing / Javascript Showcases

* Share / Rate the App
    * Should only show up once
* Build in Growth Walls for Unlimited Use
    * Limited Number of Active Lists
    * Archived Lists (Summaries only)
    * Visible Growth Mechanic Countdown of Available Lists / Notes left
    * Personal Referral Dashboard (Dropbox clone)
        * Clickthroughs from Shares
        * Friends Signed Up
        * Progress to Another Free Note
        * Share Links Ready to Share
        * Email Import
            * Possibly a service somewhere else, needs research on how local in browser this could be
            * Very possible that this will expose an API Key if I need to keep it just in flat html files
* Growth Walls Trigger Share Prompts
    * Referral Landing Page
    * Personalized Landing
    * Marketing page has different meta tags than referral page
    * Analytics (Mixpanel) Custom Public Dashboard Created For Zenefits
* Research capabilities around attaching images as something to unlock for growth
* Marketing Landing > Twilio "Text me this app"

## A/B Tests and Hypotheses
* Available Notes: Adjust amount of notes possible before hitting the growth wall
    * Driven from Optimizely
    * Ensure Zenefits team has access to these experiments (Canvas Growth Board and Optmizely Accounts)
* Test making image posts available VS locking them down to an unlockable state
    * Which one drives more share activations

## Analytics to Track

### Marketing Landing Page
* Mouseflow videos
* "Funnels"
* r= params digested for completely accurate referral sources and attribution analytics
* "Download" rate from Landing Page

### Usage Analytics
* Item Created
    * Type of item created
    * If List:
        * Count of items in list
* Time between next item created (Mixpanel JQL Formula)
* Average Daily Usage
* Average List Count
* Archived item
* Growth Wall Displayed (they were prompted by the Growth Wall to share)
* Shared
    * Platform
* Signup View
* Signed Up

### Referral Landing Pages
* Referring User
* Referring Platform
* Conversion Rate (by the above and standalone across all referred users)
* Usage Statistics of new converted users by referral source
    * Make sure that local file can retreive this stat and this referring user can follow this referred user around
    * Most likely will use Base64 Hashing and Decoding

# Design

## 4 Hours:
* Clone Google Keep Layout

## 24 Hours
* Use Brand and purchased graphics to overhaul 4 hour design to feel on-brand with landing pages.
