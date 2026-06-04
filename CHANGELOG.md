# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Video type support — `"video"` items render as `<video controls autoPlay>`
- `renderItem` prop for custom item content rendering
- Open/close fade-in animation and fade transition between items
- Image drag-to-pan when zoomed in (mouse-drag to explore zoomed areas)
- `test:coverage` script with `@vitest/coverage-v8`
- Inline mode Escape key and overlay click-to-close support
- SSR guards — safe for server-side rendering environments
- Accessibility: `role="tab"`, `aria-selected`, `aria-label` on inline dot indicators
- Comprehensive test suite expanded from 15 to 44 tests

### Fixed
- Inline mode now correctly handles `closeOnEscape` (was a no-op before)
- Inline mode now correctly handles `closeOnOverlay` (was a no-op before)

### Changed
- Updated PreviewItem type to include `"video"`
- README updated with new props, types, and features
- Replaced deprecated `actions/create-release@v1` with `softprops/action-gh-release@v2`
- Added `loading="lazy"` to `<img>` elements for performance
