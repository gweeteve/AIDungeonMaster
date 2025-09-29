# Quickstart Guide: Game System Management Interface

## Overview

This guide walks through the complete user journey for managing RPG game systems, from creation to document management and system derivation. It serves as both user documentation and integration test scenarios.

## Prerequisites

- User account with authentication
- Web browser supporting modern JavaScript
- RPG document files (JSON, PDF, or Markdown) for testing

## User Journey 1: Creating a New Game System

### Scenario: DM Creates D&D 5E System

**Goal**: Create a new game system for D&D 5E with custom homebrew content.

1. **Navigate to Game Systems Page**
   - Visit `/game-systems` 
   - Should see list of existing systems (may be empty for new users)
   - Should see "Create New System" button

2. **Create New System**
   - Click "Create New System"
   - Fill out form:
     - Name: "D&D 5E Homebrew"
     - Description: "Custom D&D 5E with homebrew spells and monsters"
     - Image: Upload custom image or leave blank for default
   - Click "Create"
   - System should appear in list with default image if none provided

3. **Verify System Creation**
   - New system should appear in user's systems list
   - System should have edit lock available (unlocked state)
   - System should show 0 documents initially

**Expected Result**: Successfully created game system ready for document uploads.

## User Journey 2: Document Management

### Scenario: Upload Game Content Documents

**Goal**: Add various types of game content to the newly created system.

1. **Upload JSON Spell Document**
   - Navigate to system details page
   - Click "Upload Document"
   - Select JSON file with spell data:
     ```json
     {
       "spells": [
         {
           "name": "Lightning Storm",
           "level": 4,
           "school": "Evocation",
           "damage": "6d6 lightning",
           "range": "120 feet"
         }
       ]
     }
     ```
   - Display Name: "Custom Spells"
   - Tags: ["spells", "homebrew", "evocation"]
   - Upload should succeed with validation

2. **Upload PDF Monster Manual**
   - Upload PDF file containing monster stat blocks
   - Display Name: "Homebrew Monsters"
   - Tags: ["monsters", "combat"]
   - Should accept large PDF files without size restrictions

3. **Upload Markdown Class Guide**
   - Upload Markdown file with character class descriptions:
     ```markdown
     # Homebrew Classes
     
     ## Artificer Variant
     A modified artificer with enhanced crafting abilities...
     
     ### Features
     - Enhanced Tool Expertise
     - Magical Tinkering
     ```
   - Display Name: "Character Classes"
   - Tags: ["classes", "character-creation"]

4. **Verify Document List**
   - System should show 3 documents
   - Each should display correct type (JSON/PDF/MARKDOWN)
   - Tags should be visible and filterable
   - File sizes should be displayed

**Expected Result**: System contains diverse document types, all properly categorized and accessible.

## User Journey 3: System Derivation

### Scenario: Create Variant Game System

**Goal**: Create a derived system based on the D&D 5E system with additional content.

1. **Start Derivation Process**
   - From D&D 5E system page, click "Create Derived System"
   - Fill out form:
     - Name: "D&D 5E - Dark Fantasy"
     - Description: "Gothic horror variant of D&D 5E"
     - Parent System: "D&D 5E Homebrew" (auto-selected)
     - Sync with Parent: True (enabled by default)

2. **Verify Inheritance**
   - New system should inherit all parent documents
   - Should show derivation relationship in UI
   - Should display sync status with parent

3. **Add Variant-Specific Content**
   - Upload JSON file with horror-themed spells:
     ```json
     {
       "spells": [
         {
           "name": "Necromantic Drain",
           "level": 3,
           "school": "Necromancy",
           "effect": "Drain life force from target"
         }
       ]
     }
     ```
   - Display Name: "Horror Spells"
   - Tags: ["spells", "horror", "necromancy"]

4. **Test Parent System Updates**
   - Return to parent system (D&D 5E Homebrew)
   - Add new document: "Equipment Lists" (Markdown)
   - Verify derived system receives update notification
   - Check that derived system shows new inherited document

**Expected Result**: Functional parent-child relationship with proper inheritance and sync capabilities.

## User Journey 4: Collaborative Editing

### Scenario: Multiple Users Edit Same System

**Goal**: Test edit locking and collaborative features.

1. **User A Acquires Edit Lock**
   - User A navigates to system details
   - Clicks "Edit System"
   - Should see lock indicator and edit form
   - Lock should show expiration time

2. **User B Attempts to Edit**
   - User B (different session) navigates to same system
   - Should see "System locked by [User A]" message
   - Edit button should be disabled
   - Should show lock expiration countdown

3. **Document Upload During Lock**
   - User B attempts to upload document
   - Should receive error message about system being locked
   - Upload should be prevented

4. **Lock Release and Takeover**
   - User A finishes editing and releases lock
   - User B should see real-time notification that system is available
   - User B can now acquire lock and edit

**Expected Result**: Edit locking prevents conflicts while allowing fair access to all users.

## User Journey 5: Document Validation

### Scenario: JSON Schema Validation

**Goal**: Test custom validation rules for uploaded JSON documents.

1. **Define Validation Schema**
   - Edit system settings
   - Add JSON Schema for spell validation:
     ```json
     {
       "type": "object",
       "properties": {
         "spells": {
           "type": "array",
           "items": {
             "type": "object",
             "properties": {
               "name": {"type": "string"},
               "level": {"type": "number", "minimum": 0, "maximum": 9},
               "school": {"type": "string"}
             },
             "required": ["name", "level", "school"]
           }
         }
       },
       "required": ["spells"]
     }
     ```

2. **Upload Valid JSON**
   - Upload JSON matching schema
   - Should succeed with no validation errors
   - Document should show "Valid" status

3. **Upload Invalid JSON**
   - Upload JSON with missing required fields:
     ```json
     {
       "spells": [
         {
           "name": "Incomplete Spell"
           // Missing level and school
         }
       ]
     }
     ```
   - Should accept upload but show validation errors
   - Errors should clearly indicate missing fields

4. **Fix Validation Errors**
   - Replace document with corrected version
   - Should clear validation errors
   - Version number should increment

**Expected Result**: Flexible validation system helps maintain data quality while allowing uploads of any valid JSON.

## User Journey 6: Session Integration

### Scenario: Use System in Gaming Session

**Goal**: Verify integration with session creation workflow.

1. **Create New Session**
   - Navigate to session creation page
   - Select "D&D 5E - Dark Fantasy" from available systems
   - System should appear with all documents listed

2. **Access System Documents in Session**
   - During session setup, view system documents
   - Should be able to download/view all document types
   - PDF should open in browser or download
   - JSON should display formatted content
   - Markdown should render properly

3. **Verify System Lock During Session**
   - Active session should not prevent system edits
   - But deletion should be prevented if system is in use

**Expected Result**: Seamless integration between system management and session workflow.

## Error Scenarios

### File Upload Errors

1. **Unsupported File Type**
   - Attempt to upload .txt or .docx file
   - Should receive clear error message
   - Should list supported types: JSON, PDF, Markdown

2. **Corrupted Files**
   - Upload corrupted PDF or invalid JSON
   - Should handle gracefully with appropriate error messages
   - Should not crash the application

3. **Duplicate Names**
   - Upload document with same display name as existing
   - Should prevent upload with clear conflict message
   - Should suggest alternative names

### System Management Errors

1. **Circular Derivation**
   - Attempt to make parent system derive from its child
   - Should prevent with clear error message

2. **Lock Timeout**
   - Acquire lock and wait for timeout (30 minutes default)
   - Lock should automatically release
   - Other users should be notified of availability

3. **Permission Errors**
   - All users should be able to edit any system (collaborative model)
   - No ownership restrictions on editing
   - Only prevent edits when system is locked

## Performance Expectations

### Page Load Times
- Systems list: < 500ms
- System details: < 500ms
- Document upload: Progress indicator for files > 10MB

### File Handling
- JSON validation: < 1 second for files up to 10MB
- PDF rendering preview: < 2 seconds
- Markdown parsing: < 100ms

### Real-time Features
- Lock status updates: < 1 second via WebSocket
- Document list refresh: < 2 seconds after upload

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- File API for uploads
- WebSocket for real-time updates
- Local Storage for user preferences
- Modern CSS Grid and Flexbox

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements accessible via Tab
- Upload areas support Enter/Space activation
- Modal dialogs trap focus appropriately

### Screen Reader Support
- Proper ARIA labels on all form controls
- Document lists announced with counts
- Upload progress announced to screen readers

### Visual Requirements
- Minimum 4.5:1 contrast ratio
- Text scales up to 200% without horizontal scrolling
- Focus indicators visible on all interactive elements

This quickstart guide serves as both user documentation and a comprehensive test suite for validating the complete game system management workflow.