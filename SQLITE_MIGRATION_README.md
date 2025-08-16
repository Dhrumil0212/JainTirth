# SQLite Database Migration & Daily Refresh Implementation

## Overview

This project has been successfully migrated from AsyncStorage to SQLite database with automatic daily refresh functionality at 12:00 AM.

## Key Changes Made

### 1. Database Service (`src/services/databaseService.js`)
- **SQLite Integration**: Replaced AsyncStorage with SQLite database
- **Tables Created**:
  - `cache_data`: Stores API data with timestamps
  - `favorites`: Stores user favorites with categories and languages
  - `settings`: Stores app settings (language, etc.)
  - `refresh_tracker`: Tracks daily refresh status

### 2. Cache Utilities (`src/services/cacheUtils.js`)
- **Updated**: Now uses SQLite database service
- **Daily Refresh**: Automatically clears cache at 12:00 AM
- **24-hour Cache**: Data expires after 24 hours

### 3. Context Providers
- **FavoritesContext**: Now uses database service for favorites management
- **LanguageContext**: Uses database for persistent language settings
- **Migration**: Automatic migration from AsyncStorage to SQLite

### 4. Background Service (`src/services/backgroundService.js`)
- **Daily Refresh**: Automatically refreshes data at 12:00 AM
- **Background Tasks**: Uses expo-background-fetch for reliable execution
- **Manual Refresh**: Available for testing purposes

### 5. Updated Components
- **PlacesGrid**: Uses database service for favorites
- **FavoritesScreen**: Updated to use new database structure
- **MainContainer**: Simplified (removed AsyncStorage dependencies)

## Features

### Database Features
- ✅ **Persistent Storage**: All data stored in SQLite database
- ✅ **Automatic Migration**: Existing AsyncStorage data migrated automatically
- ✅ **Multi-language Support**: Separate favorites for English and Hindi
- ✅ **Category Support**: Separate storage for tirth and mandir favorites

### Daily Refresh Features
- ✅ **Automatic Refresh**: Data refreshes daily at 12:00 AM
- ✅ **Background Execution**: Works even when app is closed
- ✅ **Cache Management**: Automatically clears expired cache
- ✅ **Error Handling**: Robust error handling and logging

### Performance Features
- ✅ **24-hour Cache**: Reduces API calls with intelligent caching
- ✅ **Efficient Queries**: Optimized database queries
- ✅ **Memory Management**: Proper cleanup and resource management

## Installation & Setup

### Dependencies Added
```bash
npm install expo-sqlite expo-background-fetch
```

### Database Initialization
The database is automatically initialized when the app starts:
```javascript
// In App.js
useEffect(() => {
  const initializeApp = async () => {
    await databaseService.init();
    await registerBackgroundTask();
  };
  initializeApp();
}, []);
```

## Database Schema

### cache_data Table
```sql
CREATE TABLE cache_data (
  key TEXT PRIMARY KEY,
  data TEXT,
  timestamp INTEGER,
  last_refresh INTEGER
);
```

### favorites Table
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT,
  category TEXT,
  language TEXT,
  created_at INTEGER,
  UNIQUE(item_id, category, language)
);
```

### settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at INTEGER
);
```

### refresh_tracker Table
```sql
CREATE TABLE refresh_tracker (
  id INTEGER PRIMARY KEY,
  last_refresh_date TEXT,
  next_refresh_date TEXT
);
```

## Usage Examples

### Adding a Favorite
```javascript
import { useFavorites } from '../services/FavoritesContext';

const { toggleFavorite } = useFavorites();
await toggleFavorite('Place Name', 'tirth');
```

### Getting Cached Data
```javascript
import { getCachedData, setCachedData } from '../services/cacheUtils';

const data = await getCachedData('my_cache_key');
if (!data) {
  const freshData = await fetchData();
  await setCachedData('my_cache_key', freshData);
}
```

### Manual Refresh (for testing)
```javascript
import { performManualRefresh } from '../services/backgroundService';

const success = await performManualRefresh();
```

## Background Task Configuration

The background task is configured to:
- Run every 15 minutes minimum
- Continue running after app termination
- Start automatically on device boot
- Perform daily refresh at 12:00 AM

## Migration Process

1. **Automatic Migration**: Existing AsyncStorage data is automatically migrated to SQLite
2. **Data Preservation**: All user favorites and settings are preserved
3. **Backward Compatibility**: Old AsyncStorage data is cleaned up after migration

## Error Handling

- **Database Errors**: Graceful fallback to AsyncStorage if SQLite fails
- **Background Task Errors**: Comprehensive error logging and recovery
- **Migration Errors**: Safe migration with rollback capability

## Performance Benefits

- **Faster Queries**: SQLite queries are significantly faster than AsyncStorage
- **Reduced Memory Usage**: Efficient data storage and retrieval
- **Better Reliability**: SQLite provides ACID compliance and data integrity
- **Automatic Cleanup**: Expired cache data is automatically removed

## Testing

### Test Daily Refresh
```javascript
// Manually trigger refresh for testing
import { performManualRefresh } from '../services/backgroundService';
await performManualRefresh();
```

### Test Database Operations
```javascript
import databaseService from '../services/databaseService';

// Test favorites
await databaseService.addFavorite('test_place', 'tirth', 'en');
const favorites = await databaseService.getFavorites('tirth', 'en');

// Test cache
await databaseService.setCachedData('test_key', { data: 'test' });
const cached = await databaseService.getCachedData('test_key');
```

## Troubleshooting

### Common Issues

1. **Database not initializing**
   - Check if expo-sqlite is properly installed
   - Verify app permissions

2. **Background task not working**
   - Check device battery optimization settings
   - Verify background app refresh is enabled

3. **Migration issues**
   - Check console logs for migration errors
   - Verify AsyncStorage data exists

### Debug Commands
```javascript
// Check database status
console.log('Database initialized:', databaseService.isInitialized);

// Check background task status
import { getBackgroundFetchStatus } from '../services/backgroundService';
const status = await getBackgroundFetchStatus();
console.log('Background fetch status:', status);
```

## Future Enhancements

- [ ] Add data compression for large cache entries
- [ ] Implement incremental cache updates
- [ ] Add cache analytics and monitoring
- [ ] Implement data backup and restore functionality
- [ ] Add offline-first capabilities

## Conclusion

The migration to SQLite provides:
- **Better Performance**: Faster data access and reduced memory usage
- **Reliability**: ACID compliance and data integrity
- **Scalability**: Better handling of large datasets
- **Maintainability**: Cleaner code structure and better error handling

The daily refresh functionality ensures users always have the latest data while minimizing unnecessary API calls. 