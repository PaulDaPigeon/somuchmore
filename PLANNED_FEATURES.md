# Planned Features

## Build Tab Enhancements

### Resource Progress Indicators
- [ ] Display progress bar showing how close we are to being able to build something
  - Green bar when within possible cap
  - Yellow bar when requires exceeding cap (impossible without waiting)
  - Show the lowest percentage of required resources (bottleneck resource)

### Auto-Buy System
- [ ] Enable auto-buying buildings
  - User-customizable priority order
  - Queue system for sequential builds
- [ ] Enable auto-buying research items
  - Configurable option to skip research that triggers battles
  - Priority/order customization

## Army Attack Tab Enhancements

### Resource & Time Display
- [ ] Display time required to launch attack when resources are insufficient
  - Show countdown/ETA based on current income rates
  - Similar to time-to-cap feature

### Enemy Information Display
- [ ] Display currently selected enemy numbers (unit counts)
- [ ] Display enemy numbers on opponent selector dropdown
- [ ] Display battle rewards in both places:
  - On enemy selection
  - On attack confirmation/launch

### Battle Prediction
- [ ] Add oracle-like feature to predict battle outcome in advance
  - Win/loss probability
  - Expected casualties
  - Reward preview

### Army Customization
- [ ] Allow customizing army attack use order
  - Drag-and-drop or numbered priority system
  - Configure which units attack first
  - Save custom attack order profiles
  - Per-battle or global configuration

## Wiki Feature

### In-Game Encyclopedia
- [ ] Create wiki system based on game data
  - **UI Template:** Use existing FAQ component as template/reference
  - Category sidebar similar to FAQ
  - Expandable/collapsible sections
  - Search and filter capabilities
- [ ] Browse all game entities:
  - Buildings (requirements, costs, effects)
  - Technologies (requirements, costs, unlocks)
  - Legacies (effects, costs)
  - Resources (production, consumption, caps)
  - Battles (enemies, requirements, rewards)
  - Units (stats, costs, special abilities)
- [ ] Cross-reference links between related items

## Explore Tab Enhancements

### Discovery Indicator
- [ ] Add indicator showing if there's anything currently discoverable
  - Check against already-found enemies/kingdoms
  - Visual cue (icon, badge, or highlight)
  - Tooltip with details on what's available

## Diplomacy Tab Enhancements

### Enhanced Enemy Information
- [ ] Display enemy army stats (unit composition and counts)
- [ ] Display conquest rewards for each enemy
- [ ] Show this information inline with enemy list

### Kingdom Relationship Details
- [ ] For kingdoms not on good terms:
  - Display current trade costs and rewards
  - Show what improves with better relations
- [ ] Display benefits at best possible terms
- [ ] Relationship improvement calculator:
  - Lowest number of improvements required
  - Highest number of improvements required
  - Most likely number (average/expected value)

## Priority Order

**Phase 1 (High Priority):**
1. Resource progress indicators on Build tab
2. Enemy numbers display on Attack tab
3. Discovery indicator on Explore tab

**Phase 2 (Medium Priority):**
4. Battle prediction/oracle feature
5. Diplomacy relationship calculator
6. Auto-buy buildings system

**Phase 3 (Lower Priority):**
7. Auto-buy research system
8. Wiki feature (large undertaking)
9. Advanced customization options

## Technical Considerations

- Leverage existing `game-data.js` for wiki and information displays
- Use MainStore for real-time resource tracking
- Consider performance impact of auto-buy systems (throttling, delays)
- Ensure all features are toggleable via settings menu
- Maintain consistent UI/UX with existing features
