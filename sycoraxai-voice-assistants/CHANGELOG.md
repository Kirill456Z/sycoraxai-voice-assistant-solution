# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-06-24

### Added
- **TargetAI Support**: Complete integration with TargetAI voice AI agent platform
  - New `TargetAIVoiceAssistant` interface and implementation
  - `TargetAIConnectionDetails` type for TargetAI-specific connection parameters
  - `createTargetAIVoiceAssistant` factory function
  - Updated `createVoiceAssistant` to support 'targetai' provider
  - Event mapping from `targetai-client-js-sdk` to unified `VoiceAssistantConfig` callbacks

### Changed
- Updated `GeneralConnectionDetails` to include 'targetai' provider
- Extended `ConnectionDetails` and `VoiceAssistant` union types to include TargetAI
- Updated package description to mention TargetAI support
- Added `targetai-client-js-sdk` as a peer dependency
- Bumped version to 1.2.0

### Updated
- README.md with comprehensive TargetAI usage examples
- package.json with TargetAI-related keywords and dependencies
- Type definitions to support TargetAI integration

### Technical Details
- Implemented `TargetAIVoiceAssistantImpl` class following existing patterns
- Added proper TypeScript types for TargetAI SDK integration
- Maintained backward compatibility with existing LiveKit and Retell integrations
- Added example React component demonstrating TargetAI usage

## [1.1.0] - Previous Release

### Added
- Retell AI support
- Multiple provider architecture
- React components for voice assistant UI

## [1.0.0] - Initial Release

### Added
- LiveKit integration
- Basic voice assistant functionality
- React component library

