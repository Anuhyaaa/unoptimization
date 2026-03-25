(function () {
  'use strict';

  const ROUTES = new Set(['home', 'steps', 'weekly', 'water', 'quotes', 'nutrition', 'profile', 'progress', 'distance', 'settings', 'about']);

  function getRouteFromLocation() {
    const route = window.location.hash.replace('#', '').trim();
    return ROUTES.has(route) ? route : 'home';
  }

  function navigate(route, replaceState = false) {
    if (!window.FitTrackApp) {
      return;
    }

    const resolvedRoute = ROUTES.has(route) ? route : 'home';
    window.FitTrackApp.renderRoute(resolvedRoute);

    const nextUrl = `#${resolvedRoute}`;
    if (replaceState) {
      history.replaceState({ route: resolvedRoute }, '', nextUrl);
      return;
    }

    if (window.location.hash !== nextUrl) {
      history.pushState({ route: resolvedRoute }, '', nextUrl);
    }
  }

  function handleClick(event) {
    const target = event.target.closest('[data-nav], .nav-link');
    if (!target) {
      return;
    }

    const nextRoute = target.getAttribute('data-nav') || target.getAttribute('href')?.replace('#', '');
    if (!ROUTES.has(nextRoute)) {
      return;
    }

    event.preventDefault();
    navigate(nextRoute);
  }

  function handlePopState() {
    navigate(getRouteFromLocation(), true);
  }

  function initRouter() {
    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    navigate(getRouteFromLocation(), true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }

  window.navigateTo = navigate;
})();