export function installViewportGuard() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const preventZoomKeys = new Set(['+', '-', '=', '_', '0']);

  function handleWheel(event) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && preventZoomKeys.has(event.key)) {
      event.preventDefault();
    }
  }

  function handleGesture(event) {
    event.preventDefault();
  }

  function handleTouchMove(event) {
    if (event.touches?.length > 1) {
      event.preventDefault();
    }
  }

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  window.addEventListener('gesturestart', handleGesture, { passive: false });
  window.addEventListener('gesturechange', handleGesture, { passive: false });
  window.addEventListener('gestureend', handleGesture, { passive: false });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('gesturestart', handleGesture);
    window.removeEventListener('gesturechange', handleGesture);
    window.removeEventListener('gestureend', handleGesture);
    window.removeEventListener('touchmove', handleTouchMove);
  };
}
