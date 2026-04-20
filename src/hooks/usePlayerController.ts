import { useEffect, useRef } from 'react';

export interface InputState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  interact: boolean;
  interactConsumed: boolean;
}

export function usePlayerController() {
  const input = useRef<InputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
    interact: false,
    interactConsumed: false,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') input.current.forward = true;
      if (k === 's' || k === 'arrowdown') input.current.back = true;
      if (k === 'a' || k === 'arrowleft') input.current.left = true;
      if (k === 'd' || k === 'arrowright') input.current.right = true;
      if (k === 'shift') input.current.run = true;
      if (k === 'e') {
        if (!input.current.interact) {
          input.current.interact = true;
          input.current.interactConsumed = false;
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') input.current.forward = false;
      if (k === 's' || k === 'arrowdown') input.current.back = false;
      if (k === 'a' || k === 'arrowleft') input.current.left = false;
      if (k === 'd' || k === 'arrowright') input.current.right = false;
      if (k === 'shift') input.current.run = false;
      if (k === 'e') input.current.interact = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return input;
}
