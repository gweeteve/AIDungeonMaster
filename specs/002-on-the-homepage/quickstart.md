# Quickstart: Homepage World Management Interface

## Development Setup

### Prerequisites
- Node.js 18+ installed
- Repository cloned and dependencies installed in both frontend/ and backend/

### Running the Feature
```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start frontend  
cd frontend
npm run dev
```

Visit http://localhost:3000 to access the homepage.

## Integration Test Scenarios

### Scenario 1: View Existing Worlds
**Given**: User has created worlds in the system
**When**: User navigates to the homepage
**Then**: 
- All worlds are displayed as cards
- Each world shows its image (custom or game system default)
- Each world shows its session name
- Worlds are sorted by last accessed (most recent first)
- Images load progressively with fallbacks

**Test Steps**:
1. Seed test database with sample worlds
2. Navigate to homepage
3. Verify world cards are displayed
4. Verify sorting order
5. Verify image fallback behavior

### Scenario 2: Launch Existing World
**Given**: User sees worlds on the homepage
**When**: User clicks on a world's image
**Then**:
- World's lastAccessedAt timestamp is updated
- User is navigated to the game session
- Homepage updates world order on return

**Test Steps**:
1. Note initial world order
2. Click on a world that's not first
3. Verify navigation occurs
4. Return to homepage
5. Verify world moved to first position

### Scenario 3: Create New World
**Given**: User is on the homepage
**When**: User clicks "Create New World"
**Then**:
- Dialog opens with form fields
- User can enter world name
- User can enter optional image URL
- User can select a game system
- "Create World" button creates and launches world

**Test Steps**:
1. Click "Create New World" button
2. Fill in world name: "Test Adventure"
3. Enter image URL: "https://example.com/image.jpg"
4. Select game system from dropdown
5. Click "Create World"
6. Verify world is created
7. Verify user is launched into the world

### Scenario 4: Access Game Systems Management
**Given**: User is on the homepage
**When**: User accesses game systems management
**Then**:
- Navigation to game systems interface occurs
- User can manage available game systems

**Test Steps**:
1. Locate game systems management link/button
2. Click to access management interface
3. Verify navigation to correct page
4. Verify game systems are displayed

### Scenario 5: Handle Missing Images
**Given**: A world has an invalid image URL
**When**: Homepage loads
**Then**:
- Game system's default image is shown immediately
- No broken image indicators are displayed
- User experience remains smooth

**Test Steps**:
1. Create world with invalid image URL
2. Navigate to homepage
3. Verify game system default image is shown
4. Verify no broken image UI elements

### Scenario 6: Empty State
**Given**: No worlds exist in the system
**When**: User visits homepage
**Then**:
- Appropriate empty state is displayed
- User is encouraged to create their first world
- Create world functionality is accessible

**Test Steps**:
1. Clear all worlds from database
2. Navigate to homepage
3. Verify empty state message
4. Verify create world call-to-action is present

## API Testing

### World Endpoints
```bash
# Get all worlds
curl http://localhost:3001/api/worlds

# Create new world
curl -X POST http://localhost:3001/api/worlds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Adventure",
    "gameSystemId": "uuid-of-game-system",
    "imageUrl": "https://example.com/image.jpg"
  }'

# Launch world
curl -X POST http://localhost:3001/api/worlds/world-uuid/launch
```

### Game System Endpoints
```bash
# Get all active game systems
curl http://localhost:3001/api/game-systems
```

## Frontend Component Testing

### WorldCard Component
```typescript
// Test: Renders with custom image
render(<WorldCard world={mockWorldWithImage} />);
expect(screen.getByRole('img')).toHaveAttribute('src', mockWorldWithImage.imageUrl);

// Test: Renders with fallback image
render(<WorldCard world={mockWorldWithoutImage} />);
expect(screen.getByRole('img')).toHaveAttribute('src', mockWorldWithoutImage.gameSystem.defaultImageUrl);

// Test: Handles click event
const onLaunch = jest.fn();
render(<WorldCard world={mockWorld} onLaunch={onLaunch} />);
fireEvent.click(screen.getByRole('img'));
expect(onLaunch).toHaveBeenCalledWith(mockWorld.id);
```

### CreateWorldDialog Component
```typescript
// Test: Form validation
render(<CreateWorldDialog isOpen={true} />);
fireEvent.click(screen.getByText('Create World'));
expect(screen.getByText('World name is required')).toBeInTheDocument();

// Test: Successful submission
const onSubmit = jest.fn();
render(<CreateWorldDialog isOpen={true} onSubmit={onSubmit} />);
fireEvent.change(screen.getByLabelText('World Name'), { target: { value: 'Test' } });
fireEvent.change(screen.getByLabelText('Game System'), { target: { value: 'system-id' } });
fireEvent.click(screen.getByText('Create World'));
expect(onSubmit).toHaveBeenCalledWith({
  name: 'Test',
  gameSystemId: 'system-id'
});
```

## Performance Testing

### Image Loading Performance
- Verify game system images load within 200ms
- Verify custom images don't block UI rendering
- Test with slow network conditions
- Verify graceful handling of image failures

### Homepage Load Performance
- Homepage should render initial UI within 200ms
- World data should load within 500ms
- Progressive loading of images should not affect perceived performance

## Accessibility Testing

### Keyboard Navigation
- Verify tab order is logical
- Verify all interactive elements are keyboard accessible
- Verify screen reader compatibility

### Visual Accessibility
- Verify sufficient color contrast
- Verify images have appropriate alt text
- Verify focus indicators are visible

## Cross-browser Testing

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsive Testing
- Test on desktop (1920x1080)
- Test on tablet (768x1024)
- Test on large mobile (414x896)
- Verify touch targets are appropriately sized