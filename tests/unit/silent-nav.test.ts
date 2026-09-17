import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStack, pushAllowed, resetStack, returnSilently } from '../../src/core/silent-nav';

describe('pushAllowed / getStack', () => {
  beforeEach(() => {
    resetStack();
  });

  it('starts empty', () => {
    expect(getStack()).toEqual([]);
  });

  it('records pushed urls in order', () => {
    pushAllowed('/a');
    pushAllowed('/b');
    expect(getStack()).toEqual(['/a', '/b']);
  });

  it('does not duplicate consecutive identical urls', () => {
    pushAllowed('/a');
    pushAllowed('/a');
    expect(getStack()).toEqual(['/a']);
  });

  it('allows the same url again after something else was pushed', () => {
    pushAllowed('/a');
    pushAllowed('/b');
    pushAllowed('/a');
    expect(getStack()).toEqual(['/a', '/b', '/a']);
  });
});

describe('returnSilently', () => {
  beforeEach(() => {
    resetStack();
  });

  it('replaces with the fallback when the stack is empty', () => {
    const navigate = { back: vi.fn(), replace: vi.fn() };
    returnSilently('/?variant=following', navigate);
    expect(navigate.replace).toHaveBeenCalledWith('/?variant=following');
    expect(navigate.back).not.toHaveBeenCalled();
  });

  it('goes back when a previously allowed url is on the stack', () => {
    pushAllowed('/home');
    const navigate = { back: vi.fn(), replace: vi.fn() };
    returnSilently('/?variant=following', navigate);
    expect(navigate.back).toHaveBeenCalledOnce();
    expect(navigate.replace).not.toHaveBeenCalled();
  });
});
