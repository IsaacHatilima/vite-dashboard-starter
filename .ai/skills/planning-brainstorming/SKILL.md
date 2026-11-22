---
name: planning-brainstorming
description: Use when a person wants to brainstorm an idea, feature or design, asks to be grilled or interviewed about it, or needs to work through intent, approaches and unresolved decisions before implementation. Combines brainstorming with rounds of probing questions and recommended answers. Skip fully specified changes that are already authorized.
---

# Brainstorming

Find out what the person actually wants, and why, then grill the idea until the decisions that matter are settled. Turn that conversation into a design that a capable builder can plan from without guessing.

Applies to: interactive discovery with the person who owns the idea, in software or other domains. It needs that person in the conversation. An unattended agent records unresolved product decisions for its workflow's human handoff instead of inventing answers or waiting for an interview.

This is one standalone skill: brainstorming supplies the intent, alternatives and design; grilling supplies the probing questions and decision tree throughout the conversation. It needs no other planning skill, plugin, browser server, or Factory setup. It is not a Factory stage and does not create issues or start jobs. The person may later hand its agreed design to any implementation workflow they choose.

## Look before you ask

Read the request, earlier decisions, supplied specs and the relevant project material. In an existing codebase, understand how the affected parts work today and what the request would touch. Look up facts yourself. Never ask a question the project already answers or reopen a decision the person has already made.

Separate what you know from what you are inferring:

- If everything that matters is specified and the change is authorized, do the work through the project's normal workflow. A clear edit does not need a design ceremony.
- If a consequential decision is missing, start the conversation with that decision.
- If the person explicitly wants brainstorming, stay in discussion until they ask to move on. Having enough information does not turn a discussion into permission to implement.

## Start with intent

When they have supplied a detailed request, briefly play back what they want, who it serves and why, as far as they have said. Add relevant findings from the project: constraints, conflicts, or a simpler path they may not have considered. Leave room for corrections without repeating the whole request.

When the purpose is unclear, ask one open question in their own terms. Do not attach a menu of guessed motivations. For a bakery website, whether visitors should decide to stop by or place orders changes the entire design; find that out before discussing frameworks.

Once the purpose is clear, map the unsettled decisions and start the grilling rounds below. Do not repeat discovery questions when the person has already explained the purpose.

If they did not ask for a design discussion, let them opt out and have you proceed with reasonable assumptions. If they say to dive in, stop interviewing, state the significant assumptions and continue within their authorization. Do not keep a design-approval gate after they have opted out.

## Grill the idea as you brainstorm

Map the idea as a **design tree**: each decision unlocks decisions that depend on it. Keep track of what is settled, what the person explicitly delegated to you, and what is still open. Probe assumptions, conflicting requirements, failure cases and tradeoffs rather than simply collecting preferences. Challenge a weak answer respectfully by showing the concrete consequence.

Work through the tree in **rounds**. The current frontier is every consequential question whose prerequisites are already settled. Ask that frontier together, most important first, and wait for the person's answers before asking dependent questions. If a question depends on another answer in the round, it belongs in a later round.

Each question should change what gets built and be something neither the request nor the project answers. Build it on their last answer or something you found. State the consequence when it is not obvious. Give concrete choices where useful and a recommended answer with a reason, phrased so "yes" accepts your recommendation.

```text
Q1 — <decision>: <question, choices and the consequence that matters>
Recommended: <answer and why>. Reply "yes" to accept it.

Q2 — <another decision whose prerequisites are settled>: <question>
Recommended: <answer and why>. Reply "yes" to accept it.
```

After each round, briefly play back the settled decisions, update the tree and ask the next frontier. A new answer may expose another branch or invalidate a proposal; explain that connection instead of starting an unrelated checklist. Do not reopen confirmed choices without new evidence or a changed requirement.

For example: voting closes before a meeting, and two people joined this month. Whether someone who joins mid-round gets a vote changes eligibility; it is more useful to ask about that concrete case than to ask for a list of business rules.

Cover the territory that matters, without reading out a questionnaire:

- Purpose, audience, why now, and what success looks like.
- Goals, non-goals, and outcomes that would make this a failure even if it technically works.
- Existing behaviour, previous attempts, and examples they liked or disliked.
- Constraints and details they care about.

The initial question about why they want it stays open, without suggested motivations. During grilling, include your recommendation; when they ask what you think, propose something concrete they can accept or correct.

Make routine process decisions yourself: where to look next, how to write things up, and how much detail to show. For implementation choices, follow their interest. Someone discussing tools or tradeoffs wants to participate; someone describing outcomes may be handing you those choices. Build on the existing project's stack and conventions. Record your choices as proposals or assumptions, never as decisions they made.

Finding facts is your job. Keep investigating when evidence would resolve uncertainty, and say what you found and how it affects the decision. While a fact is unresolved, hold only the questions that depend on it and continue with independent ones. Never ask the person to supply facts you can find yourself or present your recommendation as their decision.

The grilling is complete when every relevant branch is settled or explicitly delegated, with no consequential decision silently assumed. Summarise the settled decisions as a numbered list and carry them into the design. If the person opts out earlier, make remaining assumptions explicit and respect the scope they authorize.

## Compare approaches before writing the design

Once you understand the intent, lay out the viable ways to achieve it. Drop alternatives that conflict with the purpose or the existing project. Usually two or three survive; do not manufacture alternatives when there is only one sensible path.

For each, explain what the result would look like, the main tradeoff, and why it fits or does not. Recommend one. Let the person choose if they have kept that decision; if they have delegated it, state your choice and why.

Discuss the approach before presenting a full design. Feed the selected approach back into the decision tree: it may unlock questions about behaviour, scope or failure cases that were premature before. Keep grilling those decisions within the same brainstorming session. For a small, already clear request, the recommendation and short design can be one message. Preserve an approach they have already chosen rather than making them choose again.

## Show what words cannot settle

Use a short text sketch when it makes a screen, layout, flow, schedule, or structure easier to understand. When visual differences are the decision, offer a mockup or throwaway prototype using the host's available tools. Follow the host's rules for showing visuals; this skill does not require a particular browser or local server. If the person declines, stay in text unless they raise it again.

Keep requirements, scope, and conceptual tradeoffs in the conversation. A question about a UI does not automatically need a browser.

A spike can answer a question that discussion cannot: whether an interaction feels right, or whether an approach is technically feasible. Explain what it would teach you and keep it within the person's requested or agreed exploration. A throwaway spike can skip production hardening and use only the checks needed to answer its question. Label it as throwaway, bring the findings back into the design, and do not silently turn it into the production implementation.

## Write a design sized to the work

Once the intent and approach are settled, write the design. A small change needs a short note; a project needs enough detail for a builder to plan independently. If this is several independent projects, agree on their order and work through one at a time. If the scope grows materially, explain the change before expanding the design.

Cover the relevant points without forcing empty sections:

- Intent and why it matters.
- Goals, non-goals, and failure outcomes to avoid.
- Constraints and current behaviour the change must respect.
- Approaches considered, their tradeoffs, the chosen one, and why.
- The proposed behaviour, parts, and interactions in enough detail to build.
- Decisions made by the person, assumptions made by you, open questions, and choices left to the builder.
- Observable success criteria and the verification needed to establish them.

Use the project's established document location. Otherwise, in a software repo use `docs/plans/YYYY-MM-DD-<topic>-design.md`; outside software choose a sensible location for the work. A short design can stay in the conversation if no saved artifact is needed. Writing a design does not itself authorize committing or publishing it; follow the user's instructions and project workflow.

## Check whether a builder could use it

For a substantial design, read it as a capable builder who cannot ask its author for clarification. If independent review is authorized and available, a fresh reviewer can perform this check; otherwise do it yourself. Give a reviewer the document and relevant project constraints, with this brief:

> You have been handed this design and asked to plan the work. Report only the unanswered questions where a wrong guess would materially change the plan. For each, state the question and why it matters, ranked by importance. Skip choices explicitly left to the builder, reasonable implementation details, and wording nitpicks. If nothing important is missing, say so.

Resolve the findings according to who can answer them:

- Already answered by the conversation or project: put the answer in the design.
- A reasonable implementation choice: settle it and label it as your call.
- A consequential decision only the person can make: bring those questions back together, most important first, then update the design with their answers.

Keep this check bounded. It should close real gaps, not start an endless interview or review loop. A small design normally needs only your own consistency check.

## Finish the discussion and hand off

Present the design with the consequential assumptions and remaining choices easy to see. During an explicit brainstorming session, get agreement on this concrete design before moving to product implementation. Reading, investigation, and an agreed spike can happen earlier. Approval of an idea is not approval of details that were never shown.

Respect existing authorization: do not demand a new approval for the same agreed scope, or after the person has asked you to proceed with your judgment. If they wanted only a discussion or design, delivering it completes the task.

When implementation is requested, use the project's normal planning workflow. No additional skill is required. If a plan is needed, derive it from the design: concrete changes, their dependencies, appropriate checks, and completion criteria. Keep unresolved product decisions visible rather than disguising them as implementation tasks.

Combines Jesse Vincent's [Superpowers brainstorming skill](https://github.com/obra/superpowers/tree/v7.0.2/skills/brainstorming), version 7.0.2, with Matt Pocock's [grilling skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md), invoked there as `grill-me` (both MIT; see [LICENSE](LICENSE)). This port combines discovery, decision-tree interviewing and design while replacing plugin-specific handoffs and visual tooling with host-independent guidance.
