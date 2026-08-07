# modules/ai

**Status:** Reserved — not yet implemented.

## Purpose

The AI module abstracts all AI provider integrations behind interfaces.

## Planned Responsibilities

- AI provider interface definition (never SDK calls in components)
- Provider implementations: OpenAI, Anthropic, Gemini (behind interface)
- Deliverable generation: Affinity Map, Persona, Journey Map, HMW
- Prompt management

## Architectural Rules (enforced by Engineering Constitution)

- AI providers MUST be abstracted behind interfaces.
- No direct SDK calls (`openai.chat.completions.create()`) in components or hooks.
- All AI calls go through `AIProvider` interface.
- Swapping from OpenAI to Anthropic costs zero UI changes.

## Planned Interface

```ts
interface AIProvider {
  generateAfffinityMap(input: KnowledgeModel): Promise<AfffinityMap>;
  generatePersona(input: KnowledgeModel): Promise<Persona>;
  generateJourneyMap(input: KnowledgeModel): Promise<JourneyMap>;
  generateHMW(input: KnowledgeModel): Promise<HMWStatement[]>;
}
```
