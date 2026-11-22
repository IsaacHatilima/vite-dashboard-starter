---
name: quality-thermo-nuclear-review
description: Use when reviewing or finishing a change with an extremely strict maintainability bar - abstraction quality, files pushed past 1,000 lines, ad-hoc branching and spaghetti growth, wrong-layer logic, casts and optionality that hide the real contract, and missed "code judo" restructurings that would make the change dramatically simpler.
---

# Thermo-nuclear review

Applies to: reviewing a change for implementation quality, maintainability, abstraction quality and codebase health, and finishing your own change so it survives that review. Use `review` for what counts as evidence and how to write a finding, `simplicity` for line-level clarity, and the stack skills for where code belongs. Project guidance (`AGENTS.md`, `CLAUDE.md`, linters) wins over these defaults, including its own file-size limit when it sets one.

## The layering is fixed

Layers that project guidance or a selected stack skill prescribes are the architecture, not indirection to delete. JavaScript and TypeScript apps always use domain-driver (`javascript/domain-driver`): one file per action in every layer, a controller, route handler or server function that validates input and calls one service, a service that calls repositories, repositories that only query, per-action hooks, and containers that compose components. So:

- Never flag those files as thin wrappers, pass-through helpers or file sprawl, or ask to merge actions into one class, inline a repository, or skip a layer.
- Judge what's inside each layer: a controller holding a business rule, a service running queries, or a repository making decisions is the finding.
- Look for the code-judo move within that shape: a new bespoke action (`make:action`) instead of a branch inside List or Show, a missing schema that would delete defensive checks, or logic moved to the layer that owns it.

Above all, be **ambitious** about code structure. Don't stop at local cleanup. Actively search for "code judo" moves: restructurings that keep behaviour the same while making the implementation dramatically simpler, smaller, more direct and more elegant.

## Baseline

> Perform a deep code quality audit of the branch's changes.
> Rethink how to structure and implement the changes to meaningfully improve code quality without changing behaviour.
> Improve abstractions and modularity, reduce spaghetti code, and improve succinctness and legibility.
> Be ambitious: if there is a clear path to a better implementation that restructures some of the codebase, push for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

## Standards

0. **Be ambitious about structural simplification.** Look for a reframing that makes whole branches, helpers, modes, conditionals or layers disappear. Prefer the solution that feels inevitable in hindsight. Assume a code-judo move often exists: a reorganisation that uses the existing architecture better. If you see a path to delete complexity rather than rearrange it, push hard for that path.

1. **Don't let a change push a file from under 1,000 lines to over 1,000 lines without a very strong reason.** Treat it as a strong smell. Prefer extracting helpers, subcomponents, modules or local abstractions. If the diff crosses the threshold, ask whether the code should be decomposed first; waive it only for a compelling structural reason with the file still clearly organised.

2. **No random spaghetti growth in existing code.** Be highly suspicious of new ad-hoc conditionals, scattered special cases, or one-off branches in unrelated flows. "Weird if statements in random places" are a design problem, not a nit. Push the logic into a dedicated abstraction, helper, state machine, policy object or module instead of tangling an existing path.

3. **Clean the design, don't just accept working code.** If behaviour can stay the same while the structure becomes meaningfully cleaner, push for the cleaner version. Prefer simplifications that remove moving pieces over refactors that spread the same complexity around.

4. **Prefer direct, boring, maintainable code over hacky or magical code.** Brittle, ad-hoc or "magic" behaviour is a quality problem. Be skeptical of generic mechanisms that hide simple data-shape assumptions. Flag thin abstractions, identity wrappers and pass-through helpers that add indirection without clarity, other than the prescribed layers above.

5. **Push on type and boundary cleanliness.** Question unnecessary optionality, `unknown`, `any`, `mixed`, or cast-heavy code where a clearer type boundary could exist. Prefer explicit typed models or shared contracts over loosely shaped objects. If a branch relies on a silent fallback to paper over an unclear invariant, make the boundary explicit instead. For TypeScript, `typescript/best-practices` has the concrete rules.

6. **Keep logic in the canonical layer and reuse existing helpers.** Call out feature logic leaking into shared paths and implementation details leaking through APIs. Prefer the codebase's canonical utilities over bespoke near-duplicates, and push code toward the package, service or module that owns the concept.

7. **Treat needless sequential orchestration and non-atomic updates as design smells** when the cleaner structure is obvious. Independent work serialised for no reason, or related updates that can leave state half-applied, should be restructured. Don't chase micro-optimisations.

## Questions for every meaningful change

- Is there a code-judo move that would make this dramatically simpler?
- Can it be reframed so fewer concepts, branches or helper layers are needed?
- Does it improve or worsen the local architecture? Did a cohesive module become more coupled, more stateful, or harder to scan?
- Did the diff add branching where a better abstraction should exist? Do repeated conditionals signal a missing model or helper?
- Is the logic in the right file, layer and package? Did a file grow past a healthy size?
- Is each abstraction earning its keep, or just a wrapper?
- Did the diff add casts, optionality or ad-hoc object shapes that obscure the real invariant?
- Is the orchestration more sequential, or less atomic, than it needs to be?

## Flag aggressively

- A complicated implementation where a cleaner reframing would delete whole categories of complexity.
- Refactors that move code around without reducing the concepts a reader must hold.
- A file crossing 1,000 lines because of the change, especially when the new code could be split out.
- New conditionals bolted onto unrelated paths; one-off booleans, nullable modes or flags that complicate control flow; narrow edge-case handling in the middle of an already busy function; "temporary" branching likely to become permanent.
- Feature-specific logic leaking into general-purpose modules, or logic added in the wrong layer.
- Generic "magic" handling that hides simple structure; thin wrappers and identity abstractions.
- Unnecessary casts, `any`, `unknown` or optional parameters that muddy the contract.
- Copy-pasted logic instead of an extracted helper; a bespoke helper where a canonical one exists.
- Sequential async flow where independent work could run in parallel; partial updates that leave state less atomic than necessary.
- Refactors that pass the tests but make the code less modular or less readable.

## Preferred remedies

- Delete a layer of indirection rather than polishing it.
- Reframe the state model so conditionals disappear instead of being centralised.
- Move the ownership boundary so the feature becomes a natural extension of an existing abstraction.
- Turn special cases into a simpler default flow with fewer exceptions.
- Extract a pure function; split a large file into focused modules; move feature logic behind its own abstraction.
- Replace condition chains with a typed model or an explicit dispatcher.
- Separate orchestration from business logic; collapse duplicate branches into one clearer flow.
- Reuse the canonical helper; make type boundaries explicit so control flow gets simpler.
- Parallelise independent work where that also simplifies the flow; make related updates atomic.

Don't settle for "maybe rename this" when the real issue is structural, or for a cleaner version of the same messy idea when a much simpler idea is plausible.

## Approval bar

Behaviour that seems correct is not enough. Approve only when there is:

- no structural regression;
- no visible, clearly better path that makes the implementation dramatically simpler;
- no unjustified file-size explosion;
- no spaghetti growth from special-case branching;
- no hacky or magical abstraction that makes the code harder to reason about;
- no unnecessary wrapper, cast or optionality churn obscuring the design;
- no architecture-boundary leak or avoidable duplication of a canonical helper;
- no missed decomposition that would materially improve maintainability.

Treat these as blockers unless the change justifies them clearly:

- it keeps a lot of incidental complexity when a plausible code-judo move would delete it;
- it pushes a file from below 1,000 lines to above 1,000 lines;
- it adds ad-hoc branching that tangles an existing flow;
- it solves a local problem by scattering feature checks across shared code;
- it adds an unnecessary abstraction, wrapper or cast-heavy contract;
- it duplicates an existing helper or puts logic in the wrong layer when there is a clear canonical home.

## Writing the findings

Order findings: structural regressions; missed dramatic simplifications; spaghetti and branching growth; boundary, abstraction and type-contract problems; file size and decomposition; modularity; legibility. Prefer a few high-conviction findings over a long list of cosmetic notes, and leave nits out when structural problems exist.

Each finding still meets `review`'s evidence rules: the location (`path:line`), what the code does now, the concrete restructuring you want, and why it is simpler, with the concepts or branches it removes. A missed simplification is a finding only when you can describe the simpler design concretely enough for the builder to implement it without changing behaviour.

Be direct, serious and demanding; not rude, and never soften a major maintainability problem into a mild suggestion. For example:

- `this pushes the file past 1k lines. can we decompose this first?`
- `this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?`
- `this works, but it makes the surrounding code more spaghetti. let's keep the behaviour and restructure the implementation.`
- `why does this need a cast / optional here? can we make the boundary explicit instead?`
- `there's a code-judo move here: if <model> owns <decision>, these three branches disappear.`

## When you're the author

Before you hand a change to review, run this bar on your own diff: look for the code-judo move first, then the blockers above. Fixing them yourself is cheaper than a review round.

Adapted from Cursor's [thermo-nuclear-code-quality-review](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/thermo-nuclear-code-quality-review/SKILL.md) (MIT, see [LICENSE](LICENSE)).
