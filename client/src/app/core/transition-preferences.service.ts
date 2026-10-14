/*
 * Preferenze delle transizioni, salvate nel browser e valide per tutte le presentazioni:
 * la transizione predefinita, che ricevono i nuovi collegamenti tra frame, e quella copiata
 * da un collegamento per incollarla su altri (anche di un'altra presentazione).
 */
import { Injectable, signal } from '@angular/core';
import { DEFAULT_TRANSITION, Transition, normalizeTransition, sameTransition } from '../model/transition';

const DEFAULT_KEY = 'premi.default-transition';
const COPIED_KEY = 'premi.copied-transition';

// la memoria del browser può non essere disponibile (navigazione privata, permessi)
function read(key: string): Transition | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (normalizeTransition(JSON.parse(raw)) ?? null) : null;
  } catch {
    return null;
  }
}

function write(key: string, transition: Transition | null): void {
  try {
    if (transition) localStorage.setItem(key, JSON.stringify(transition));
    else localStorage.removeItem(key);
  } catch {
    // la preferenza resta solo fino alla chiusura della pagina
  }
}

/** Solo le proprietà della transizione, senza i frame di un collegamento. */
const props = (transition: Transition): Transition =>
  Object.fromEntries(Object.keys(DEFAULT_TRANSITION).map((key) => [key, transition[key as keyof Transition]])) as unknown as Transition;

@Injectable({ providedIn: 'root' })
export class TransitionPreferences {
  private readonly defaultState = signal(read(DEFAULT_KEY) ?? DEFAULT_TRANSITION);
  private readonly copiedState = signal(read(COPIED_KEY));

  /** transizione dei nuovi collegamenti tra frame */
  readonly defaultTransition = this.defaultState.asReadonly();
  /** transizione copiata, da incollare; null se non se n'è copiata nessuna */
  readonly copied = this.copiedState.asReadonly();

  setDefault(transition: Transition): void {
    const value = props(transition);
    this.defaultState.set(value);
    // quella di partenza non si salva: se cambia in una versione futura, si segue quella
    write(DEFAULT_KEY, sameTransition(value, DEFAULT_TRANSITION) ? null : value);
  }

  /** Torna alla transizione predefinita di partenza. */
  resetDefault(): void {
    this.setDefault(DEFAULT_TRANSITION);
  }

  copy(transition: Transition): void {
    const value = props(transition);
    this.copiedState.set(value);
    write(COPIED_KEY, value);
  }
}
