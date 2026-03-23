# From Chat to Canvas — Problem Definition

## Problem

When people use AI to create or refine content (emails, essays, plans, code), they're forced to manage iteration through linear chat messages. There's no way to go back to a previous version, edit just one section, compare what changed, or branch into a different direction without losing progress. This causes people to either give up early (averaging just 1.7 messages per conversation) or resort to workarounds like scrolling through history, copy-pasting into Google Docs, and manually tracking versions.

## Who It Hurts Most

Non-technical users — writers, students, job seekers, small business owners, marketers — who are creating and refining text-based content with AI. They don't have Cursor or VS Code. They have a chat box.

## Key Data Points

- 2.5B+ messages sent daily to ChatGPT alone
- 1.7 average messages per conversation — most users bail after one response
- 14 min average session for power users who do iterate
- 67% task success rate on Claude.ai — a third of tasks fail
- An entire ecosystem of Chrome extensions exists just to move AI output into Google Docs — every one is evidence the refinement experience is broken

## Root Cause

The refinement loop and error recovery are the same structural problem: chat is linear and append-only. Every message pushes forward. There's no mechanism to go backward, branch sideways, or hold two states at once. Existing features (reply, edit/branch, clarification widgets) are primitives without a unifying interaction layer.

## Goal

Enable non-technical users to iteratively shape AI-generated content with the same ease and control as editing a document — so that refining an output feels like sculpting, not shouting instructions across a room.

## HMW #1 — Navigate Between and Recombine Versions

How might we let users navigate between and recombine versions of AI-generated content — so that "go back to version 2 but keep the new intro" becomes a one-step action?

## HMW #2 — Edit Specific Sections In Place

How might we let users edit specific sections of AI-generated content in place — so that refining one paragraph doesn't mean regenerating and re-verifying the entire output?

## User Stories

### HMW #1 — Versions

- **US 1.1 — Version Awareness:** As a user refining content with AI, I want to see that multiple versions exist and quickly switch between them — so I don't have to scroll through chat history to find a previous version.
- **US 1.2 — Version Comparison:** As a user with multiple iterations, I want to see what changed between two versions side by side — so I can decide which parts are better without comparing mentally.
- **US 1.3 — Cherry-Pick Across Versions:** As a user who likes parts of different versions, I want to pull specific sections from one version into another — so I don't have to describe in words which pieces I want.
- **US 1.4 — Safe Exploration:** As a user happy with the current version, I want to bookmark it before trying something different — so I can always come back.

### HMW #2 — Selective Editing

- **US 2.1 — Targeted Regeneration:** As a user who likes most of the output, I want to select one section and ask the AI to rework just that part — so the rest stays untouched.
- **US 2.2 — Inline Instruction:** As a user who wants a specific change, I want to highlight a paragraph and give a short instruction like "make this more confident" — so I don't have to re-explain full context.
- **US 2.3 — Change Visibility:** As a user who asked the AI to revise a section, I want to see exactly what changed — so I can quickly approve or reject the edit.
- **US 2.4 — Manual Override:** As a user who knows exactly what to say, I want to type directly into the output and have the AI respect my edits — so my words don't get overwritten.
