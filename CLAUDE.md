# Spotlux Frontend Documentation

> **Navigation**: For root architecture overview, see [../CLAUDE.md](../CLAUDE.md) | For backend details, see [../spotlux-backend/CLAUDE.md](../spotlux-backend/CLAUDE.md)

This document provides complete reference documentation for the Spotlux frontend Next.js application.

## Tech Stack

- **Next.js 15** with App Router
- **React 19** with Server Components
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Turbopack** for fast builds
- **iconoir-react** for icons (NOT lucide-react)

## Development Commands

```bash
# Navigate to frontend
cd spotlux-web

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Application Architecture

**Routing Structure** (App Router):

- `/` - Home feed (authenticated) - Unified feed with dynamic diversity scoring (highlights + matchups + lifestyle)
- `/login` - Authentication
- `/register` - User registration
- `/profile` - User profile with highlights management (authenticated)
- `/settings` - User settings (authenticated)
- `/search` - Search functionality (authenticated)
- `/messages` - Messaging (authenticated)
- `/friends` - Friends management (authenticated)
- `/internal-tools` - Internal tools (prompts, categories) (authenticated, admin only)

**Layout Pattern**:
- `UnauthenticatedLayout`: Landing, login, register pages
- `AuthenticatedLayout`: Dashboard with sidebar navigation and protected routes

## State Management

### Context API Usage

**AuthContext** (`src/contexts/AuthContext.tsx`):
- Manages user authentication state and JWT tokens
- Provides: `user`, `login()`, `logout()`, `isLoading`, `isAuthenticated`
- Handles token refresh automatically
- Persists auth state across page reloads

**Usage**:
```tsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Welcome, {user.name}!</div>;
};
```

**ThemeContext** (`src/contexts/ThemeContext.tsx`):
- Manages dark/light mode preference
- Provides: `theme`, `toggleTheme()`, `setTheme()`
- Syncs with system preference
- Persists to localStorage

**Usage**:
```tsx
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};
```

### When to Use Context vs Props

**Use Context for**:
- Authentication state (accessed by many components)
- Theme preferences (affects entire app)
- WebSocket connection (shared real-time state)
- User preferences (language, settings)

**Use Props for**:
- Component-specific data
- Callback functions
- One or two levels of component nesting
- Data that doesn't need to be global

## Mobile-First UX Architecture

**IMPORTANT**: Spotlux is designed **mobile-first**. See `/docs/UX_ARCHITECTURE.md` for complete specifications.

**Development Approach:**
- **Web (Phase 1):** Quick iteration, button-based interactions, validate UX/retention
- **Native Mobile (Phase 2):** Production app with gesture controls, camera integration, push notifications

**Core Navigation:** 5-tab bottom navigation
1. **Home** - For You Feed (AI-curated content, vote queue)
2. **Compete** - Leaderboard, team standings, point opportunities
3. **Post** (center) - Camera/upload, quick posting flow
4. **Team** - Messages, team activity, teammate celebration
5. **You** - Streaks, progress, stats, settings

**Global Header:**
- 🔔 Notifications (feedback, team milestones, competition updates)
- 💬 DMs (direct messages, slides in as overlay)

**Key UX Principles:**
- **Competition over cringe** - ESPN ticker aesthetic, not wellness app
- **Purposeful engagement** - 15-20 mins/day, not doomscrolling
- **Mobile-first specs:**
  - Viewport: 375-430px width (iPhone SE to Pro Max)
  - Safe areas: `env(safe-area-inset-top/bottom)` for iPhone notch
  - Touch targets: 44px minimum
  - Bottom nav: 80px + safe area
  - Header: 60px + safe area

**Web Implementation:**
- Responsive mobile-first (Tailwind utilities)
- Button-based interactions (no swipe gestures yet)
- Desktop: Simple side nav (just for testing, not polished)
- Focus on <768px viewport

**Native Mobile (Future):**
- Gesture-based voting (Tinder swipe)
- TikTok-style feed (smooth vertical scroll)
- Native camera integration
- Push notifications
- Haptic feedback
- Offline support

## Component Organization

**Page Structure Convention**:
All `page.tsx` files in the `src/app/` directory should follow this clean, minimal pattern:

```typescript
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import PageComponent from "@/components/feature/PageComponent";

const Page = () => {
  return (
    <AuthenticatedLayout>
      <PageComponent />
    </AuthenticatedLayout>
  );
};

export default Page;
```

**Key Principles**:

- ✅ `page.tsx` files should ONLY handle routing and layout wrapping
- ✅ All business logic, state, and UI should live in components under `src/components/`
- ✅ Component should be named with "Page" suffix (e.g., `MessagesPage`, `FriendsPage`, `SearchPage`)
- ✅ Complex pages should be split into logical subcomponents within their feature directory
- ❌ DO NOT put business logic, hooks, or state management directly in `page.tsx`
- ❌ DO NOT create massive single-file components

**Component Directory Structure**:

```
src/components/
├── auth/                 # Authentication components
│   ├── AuthFormContainer.tsx
│   └── ProtectedRoute.tsx
├── common/              # Shared UI components
│   ├── Button.tsx
│   ├── CircleButton.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── Alert.tsx
│   ├── VideoCropStep.tsx
│   ├── ImageCropModal.tsx
│   ├── Icon.tsx
│   ├── Input/
│   └── LoadingState.tsx
├── dashboard/           # Dashboard views
├── feed/                # Unified feed components
│   ├── UnifiedFeedPage.tsx     # Main feed page with infinite scroll
│   ├── HighlightItem.tsx       # Full-screen highlight with reactions/comments/mute
│   ├── MatchupItem.tsx         # Wrapper for MatchupCard in feed
│   ├── LifestyleItem.tsx       # Lifestyle aggregate carousel
│   ├── VideoOverlay.tsx        # Video metadata overlay (creator, prompt, stats)
│   ├── ReactionPanel.tsx       # Top 3 reactions + smiley button (polymorphic - any content type)
│   ├── ReactionModal.tsx       # Full emoji grid modal (polymorphic - any content type)
│   ├── CommentButton.tsx       # Comment count button
│   ├── CommentModal.tsx        # Comment list and input modal (polymorphic - any content type)
│   └── CommentItem.tsx         # Individual comment with like button
├── footer/              # Footer component
├── friends/             # Friends feature components
│   ├── FriendsPage.tsx
│   ├── FriendsHeader.tsx
│   ├── FriendsTabNavigation.tsx
│   ├── FriendsListTab.tsx
│   ├── ReceivedRequestsTab.tsx
│   └── SentRequestsTab.tsx
├── internal-tools/      # Internal tools page components
│   ├── PromptsPage.tsx
│   └── PromptCategoriesPage.tsx
├── landing/             # Landing page
├── layout/              # Layout wrappers
│   ├── AuthenticatedLayout.tsx
│   └── UnauthenticatedLayout.tsx
├── lifestyle/           # Lifestyle tracking components
│   ├── LifestyleFeedPage.tsx
│   ├── LifestyleFeedCard.tsx
│   ├── LifestyleFeedPost.tsx
│   ├── LifestylePromptSelect.tsx
│   ├── LifestylePostCreate.tsx
│   ├── LifestylePage.tsx           # Main lifestyle page with calendar
│   ├── CalendarGrid.tsx            # Monthly calendar grid with activity heatmap
│   ├── CalendarDayModal.tsx        # Modal showing posts for selected day
│   ├── MiniCalendar.tsx            # Compact 30-day calendar widget
│   └── SleepInsights.tsx           # Sleep analytics (wake time, sleep time, duration)
├── matchup/             # Matchup voting components
│   ├── MatchupCard.tsx
│   ├── MatchupVideoCard.tsx
│   └── CommentModal.tsx
├── messages/            # Messaging feature components
│   ├── MessagesPage.tsx
│   ├── MessagesPageDesktop.tsx
│   ├── MessagesPageMobile.tsx
│   ├── MessagesHeader.tsx
│   ├── ConversationHeader.tsx
│   ├── ConversationView.tsx
│   ├── ConversationList.tsx
│   ├── MessageThread.tsx
│   ├── MessageInput.tsx
│   ├── NewConversationModal.tsx
│   ├── FriendMatchupMessageBubble.tsx   # Renders matchup messages (invite/active/result states)
│   ├── CreateFriendMatchupModal.tsx     # Create 1v1 challenge flow (settings → video → upload)
│   ├── RespondToMatchupModal.tsx        # Accept challenge flow (preview → video → upload)
│   └── FriendMatchupDetailModal.tsx     # View matchup details and vote
├── navigation/          # Navigation components
│   ├── Sidebar.tsx
│   └── MobileNav.tsx
├── profile/highlights/  # Highlight management
│   ├── StoryViewer.tsx
│   ├── HighlightReelCard.tsx
│   ├── HighlightReelGrid.tsx
│   ├── CreateReelModal.tsx
│   ├── EditReelModal.tsx
│   └── HighlightUploadModal.tsx
├── register/            # Registration flow
├── search/              # Search feature components
│   ├── SearchPage.tsx
│   ├── SearchInput.tsx
│   ├── UserList.tsx
│   └── Pagination.tsx
└── settings/            # Settings UI
```

**Subcomponent Organization**:
When a page becomes complex:

1. Create a main `{Feature}Page.tsx` component with orchestration logic
2. Extract UI sections into focused subcomponents (e.g., headers, tabs, lists, forms)
3. Keep subcomponents in the same feature directory
4. Each subcomponent should have a single, clear responsibility

## Reusable Components

**IMPORTANT**: Always use existing reusable components from `src/components/common/` instead of creating custom inline implementations.

**Available Reusable Components**:

- **Button** (`src/components/common/Button.tsx`)
  - Use for all standard buttons
  - Variants: `primary`, `secondary`, `danger`, `success`
  - Sizes: `sm`, `md`, `lg`
  - Supports: loading states, left/right icons, disabled state
  - Example: `<Button variant="primary" size="md" isLoading={loading}>Submit</Button>`

- **CircleButton** (`src/components/common/CircleButton.tsx`)
  - Use for circular icon buttons (mute, close, arrows, navigation, etc.)
  - Variants: `default`, `accent`, `muted`
  - Sizes: `sm`, `md`, `lg`
  - Example: `<CircleButton size="md" variant="default" aria-label="Mute"><VolumeIcon /></CircleButton>`
  - **When to use**: Anytime you need a circular button with an icon or number inside

- **Modal** (`src/components/common/Modal.tsx`)
  - Use for all modal dialogs
  - Supports: custom titles, sizes, footer buttons, loading states, escape key handling
  - Sizes: `sm`, `md`, `lg`, `xl`, `full`
  - Auto-handles: overlay clicks, escape key, body scroll prevention
  - **SSR-safe**: Uses portal rendering with mounted state to prevent hydration mismatches
  - **z-index**: `z-[60]` to ensure modals appear above all other content
  - Example:
  ```tsx
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Edit Profile"
    size="md"
    showFooter
    confirmText="Save"
    cancelText="Cancel"
    onConfirm={handleSave}
  >
    {/* Modal content */}
  </Modal>
  ```

- **AddButton** (`src/components/common/AddButton.tsx`)
  - Use for adding new items (rounded square with + icon)
  - Example: `<AddButton onClick={handleAdd} ariaLabel="Add item" />`

- **VideoCropStep** (`src/components/common/VideoCropStep.tsx`)
  - Video trimming and cropping with zoom, pan, timeline controls
  - Self-contained component with auto-playing preview
  - Exports cropped video as Blob
  - Example: `<VideoCropStep videoFile={file} onCropComplete={handleCrop} onCancel={handleCancel} aspectRatio={9/16} maxDuration={15} />`

- **ImageCropModal** (`src/components/common/ImageCropModal.tsx`)
  - Image cropping in modal dialog with zoom and pan
  - Fixed aspect ratio (1:1 for profile photos)
  - Example: `<ImageCropModal isOpen={isOpen} imageFile={file} onCropComplete={handleCrop} onClose={handleClose} />`

- **Select** (`src/components/common/Select.tsx`)
  - Dropdown select input with label
  - Supports required, disabled, error states
  - Example: `<Select label="Sport" value={value} onChange={handleChange} options={options} required />`

- **Alert** (`src/components/common/Alert.tsx`)
  - Dismissible alert messages
  - Variants: `error`, `success`, `warning`, `info`
  - Example: `<Alert variant="error" onClose={handleDismiss}>Error message</Alert>`

**When Creating New Components**:

- ✅ Check `src/components/common/` first for existing reusable components
- ✅ If you find yourself writing inline button/modal/icon styles, use the reusable components instead
- ✅ If creating a new pattern that appears 3+ times, consider making it a reusable component
- ❌ DO NOT create custom modals when the reusable Modal exists
- ❌ DO NOT write inline circular button styles when CircleButton exists
- ❌ DO NOT create custom button implementations when Button exists

## Form Patterns

### Controlled Components

**Standard form pattern**:
```tsx
const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sport: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.submitForm(formData);
      // Success handling
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />

      {errors.submit && <Alert variant="error">{errors.submit}</Alert>}

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
};
```

### Form Validation Rules

**Client-side validation**:
- Required fields: Check for non-empty values
- Email: Basic regex or `.includes('@')`
- Phone: Format validation
- Passwords: Minimum length, complexity rules
- Custom: Business logic validation

**When to validate**:
- `onBlur`: Validate when user leaves field
- `onChange`: Clear errors as user types (don't show errors yet)
- `onSubmit`: Final validation before API call

### File Upload Forms

**Pattern for image/video uploads**:
```tsx
const handleFileSelect = async (file: File) => {
  // 1. Validate file
  if (!file.type.startsWith('image/')) {
    setError('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError('File must be under 5MB');
    return;
  }

  // 2. Show cropper/editor if needed
  setFileToEdit(file);
  setShowCropper(true);
};

const handleCropComplete = async (croppedBlob: Blob) => {
  setIsUploading(true);
  try {
    // 3. Get presigned URL
    const { uploadUrl, fileUrl } = await uploadApi.getPresignedUrl({
      fileName: 'profile.jpg',
      fileType: 'image/jpeg',
    });

    // 4. Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: croppedBlob,
      headers: { 'Content-Type': 'image/jpeg' },
    });

    // 5. Save file URL to database
    await userApi.updateProfile({ photoUrl: fileUrl });
  } catch (error) {
    setError('Upload failed');
  } finally {
    setIsUploading(false);
  }
};
```

## Loading States

### Standard Loading Patterns

**Component-level loading**:
```tsx
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.getData();
        setData(result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading data..." />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return <div>{/* Render data */}</div>;
};
```

**Button loading states** (use existing Button component):
```tsx
<Button
  variant="primary"
  isLoading={isSubmitting}
  disabled={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

**Skeleton loading** (for smooth UX):
```tsx
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-bg-col/50 rounded-lg mb-4" />
    <div className="h-4 bg-bg-col/50 rounded w-3/4 mb-2" />
    <div className="h-4 bg-bg-col/50 rounded w-1/2" />
  </div>
);

// Use while data is loading
{isLoading ? <SkeletonCard /> : <DataCard data={data} />}
```

**Optimistic updates** (instant feedback):
```tsx
const handleLike = async (postId: number) => {
  // 1. Update UI immediately
  setPosts(prev => prev.map(post =>
    post.id === postId
      ? { ...post, isLiked: true, likeCount: post.likeCount + 1 }
      : post
  ));

  // 2. Send API request
  try {
    await api.likePost(postId);
  } catch (error) {
    // 3. Rollback on error
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked: false, likeCount: post.likeCount - 1 }
        : post
    ));
    toast.error('Failed to like post');
  }
};
```

## Video & Image Processing

### Video Cropping (`VideoCropStep.tsx`)

**Location**: `src/components/common/VideoCropStep.tsx`

Self-contained video cropper component with:
- Zoom (0.5x - 3x) and pan controls
- Timeline trimming (up to 15s max duration)
- Unified range slider with draggable handles and middle section
- Auto-playing video preview (9:16 aspect ratio)
- Touch and mouse event support for mobile web
- Real-time canvas rendering at 30 FPS
- MediaRecorder API for export (WebM/VP8 codec)

**Usage**:
```tsx
<VideoCropStep
  videoFile={file}
  onCropComplete={(blob) => handleCropped(blob)}
  onCancel={() => setIsCropping(false)}
  aspectRatio={9 / 16}
  maxDuration={15}
/>
```

**Integration**:
- Used in `EditReelModal.tsx` (highlight reel editing)
- Used in `HighlightUploadModal.tsx` (new highlight upload)

### Image Cropping (`ImageCropModal.tsx`)

**Location**: `src/components/common/ImageCropModal.tsx`

Modal-based image cropper with:
- Zoom and pan controls
- Fixed aspect ratio (1:1 for profile photos)
- Canvas-based rendering
- Blob export for upload

### Compression & Upload

**Video Compression** (`src/lib/compression.ts`):
- Uses `FFmpeg.wasm` for browser-based video compression
- Target bitrate: 2.5 Mbps
- Progress tracking via callback
- File size validation (max 100MB)

**Image Compression** (`src/lib/compression/imageCompression.ts`):
- Uses `browser-image-compression` for client-side image compression
- **HEIC Support**: Automatically converts iOS HEIC/HEIF images to JPEG using `heic2any`
- Target: 1MB max size, 1920px max dimension, 85% quality
- Validates file type by MIME type AND extension (handles HEIC edge cases)
- Helper functions: `compressImage()`, `validateImageFile()`

**Upload Flow**:
1. Client validates file (size, type)
2. Client requests presigned S3 URL from `/api/v1/upload`
3. Client uploads directly to S3 (bypasses backend)
4. Client creates highlight/reel record with S3 URL

**Helper Functions**:
- `compressAndUploadHighlight()` - Compress video, upload to S3, create highlight
- `validateVideoFile()` - Validate size and format

## Custom Hooks

**Location**: `src/hooks/`

- **useUnifiedFeed.ts** - Unified feed state management
  - Manages feed items array, cursor, hasMore state
  - Infinite scroll with cursor-based pagination
  - Auto-loads initial content, loads more on scroll
  - Backend handles view tracking automatically
  - State: `items`, `isLoading`, `error`, `hasMore`
  - Methods: `loadMore()`, `refresh()`

- **useMatchupVoting.ts** - Matchup vote handling
  - `castVote(matchupId, highlightId, comment?)` - Submit vote
  - State: `isVoting`, `hasVoted`, `votedFor`, `voteError`

- **useImageCrop.ts** - Image cropping state and canvas operations
  - Manages zoom, pan, canvas rendering
  - Exports cropped image as Blob

- **useContentReactions.ts** - Polymorphic reactions for any content type (highlights, lifestyle posts)
  - Fetches aggregated reaction data for highlights OR lifestyle posts
  - Handles optimistic updates for add/remove reactions
  - Auto-rollback on API errors
  - State: `reactions`, `userReaction`, `totalCount`, `isLoading`, `error`
  - Methods: `addReaction(emojiId)`, `removeReaction()`, `refetch()`
  - Usage: `useContentReactions('highlight', highlightId)` or `useContentReactions('lifestyle_post', postId)`

- **useContentComments.ts** - Polymorphic comments for any content type (highlights, lifestyle posts)
  - Fetches paginated comments with hot ranking
  - Handles optimistic updates for add/delete/like/unlike
  - Auto-rollback on API errors
  - State: `comments`, `totalCount`, `hasMore`, `isLoading`, `error`
  - Methods: `addComment(text)`, `deleteComment(id)`, `likeComment(id)`, `unlikeComment(id)`, `loadMore()`
  - Usage: `useContentComments('highlight', highlightId)` or `useContentComments('lifestyle_post', postId)`

- **useLifestyleFeedData.ts** - Lifestyle feed state management
  - Manages lifestyle feed items, cursor-based pagination
  - Handles aggregate view tracking
  - State: `items`, `isLoading`, `error`, `hasMore`, `nextCursor`
  - Methods: `loadMore()`, `refresh()`

## Unified Feed Implementation

### Overview

The unified feed (`UnifiedFeedPage.tsx`) is the home page experience combining three content types:
- **Highlights** - Individual video clips with reactions, comments, and mute controls
- **Matchups** - Head-to-head video comparisons with voting
- **Lifestyle** - Daily activity aggregates in carousel format

**Architecture**: Vertical snap-scroll infinite feed with viewport-based activation and buffer optimization.

### Component Structure

**Main Feed Component** (`src/components/feed/UnifiedFeedPage.tsx`):

```typescript
export default function UnifiedFeedPage() {
  const { items, isLoading, hasMore, error, loadMore } = useUnifiedFeed();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Key features:
  // - IntersectionObserver for detecting current visible item
  // - Auto-load more when approaching end (remainingItems <= 2)
  // - Buffer optimization (only render current ± 1 items)
  // - SSR-safe container height calculation
  // - Error recovery UI with retry button
  // - Empty state and "all caught up" messaging
}
```

**Key Implementation Details**:

1. **Container Height Calculation** (SSR-safe):
   ```typescript
   const [containerHeight, setContainerHeight] = useState<number | null>(null);

   useEffect(() => {
     const calculateHeight = () => {
       const isMobile = window.innerWidth < 768;
       if (isMobile) {
         return window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
       }
       return window.innerHeight; // Desktop: full viewport
     };
     setContainerHeight(calculateHeight());
   }, []);
   ```

2. **IntersectionObserver** (memory leak prevention):
   ```typescript
   useEffect(() => {
     const observer = new IntersectionObserver((entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
           const index = parseInt(entry.target.getAttribute('data-index') || '0');
           setCurrentIndex(index);
         }
       });
     }, { root: containerRef.current, threshold: 0.5 });

     // Only observe items in buffer range (current ± 2)
     const itemElements = containerRef.current.querySelectorAll('[data-index]');
     itemElements.forEach((el, index) => {
       if (Math.abs(index - currentIndex) <= 2) {
         observer.observe(el);
       }
     });

     return () => observer.disconnect();
   }, [items.length, currentIndex]);
   ```

3. **Infinite Scroll Trigger**:
   ```typescript
   useEffect(() => {
     const remainingItems = items.length - currentIndex;
     // Prevent infinite loop if loadMore fails repeatedly
     if (hasMore && !isLoading && !error && remainingItems <= 2) {
       loadMore();
     }
   }, [currentIndex, items.length, hasMore, isLoading, error, loadMore]);
   ```

4. **Buffer Optimization** (render current ± 1):
   ```typescript
   const isActive = index === currentIndex;
   const inBuffer = Math.abs(index - currentIndex) <= 1;

   {!inBuffer ? (
     <div style={{ height: containerHeight || '100vh' }} />
   ) : (
     // Render actual component
   )}
   ```

5. **React Key Uniqueness** (handles transient matchups):
   ```typescript
   // In feed.ts getMixedFeed():
   const matchupId = item.matchup.id === 0
     ? `${item.matchup.highlightAId}_${item.matchup.highlightBId}`  // Composite ID
     : item.matchup.id.toString();  // Real ID

   return {
     type: 'matchup' as const,
     id: `matchup-${matchupId}`,  // Unique key
     data: item.matchup,
   };
   ```

### Feed Item Components

**HighlightItem** (`src/components/feed/HighlightItem.tsx`):

Full-screen highlight with all interactive features:
- **Video playback** - Auto-play/pause based on `isActive` prop
- **Mute control** - CircleButton in top-right corner
- **Reactions** - ReactionPanel (top 3) + ReactionModal (full grid)
- **Comments** - CommentButton + CommentModal
- **Video overlay** - Creator info, prompt, stats

```typescript
export default function HighlightItem({ highlight, isActive }: HighlightItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const {
    reactions,
    addReaction,
    removeReaction,
  } = useHighlightReactions(highlight.id);

  const {
    comments,
    totalCount: commentCount,
    hasMore: hasMoreComments,
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    loadMore: loadMoreComments,
  } = useHighlightComments(highlight.id);

  // Auto-play/pause based on isActive prop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-black">
      {/* Video */}
      <video ref={videoRef} muted={isMuted} loop playsInline />

      {/* Mute Button */}
      <div className="absolute top-4 right-4">
        <CircleButton onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <SoundOff /> : <SoundHigh />}
        </CircleButton>
      </div>

      {/* Video Overlay */}
      <VideoOverlay highlight={highlight} />

      {/* Reactions & Comments */}
      <div className="absolute bottom-20 right-4">
        <ReactionPanel
          reactions={reactions}
          onReactionClick={() => setShowReactionModal(true)}
        />
        <CommentButton
          count={commentCount}
          onClick={() => setShowCommentModal(true)}
        />
      </div>

      {/* Modals */}
      <ReactionModal /* ... */ />
      <CommentModal /* ... */ />
    </div>
  );
}
```

**MatchupItem** (`src/components/feed/MatchupItem.tsx`):

Wrapper for MatchupCard that passes through `isActive` prop:

```typescript
export default function MatchupItem({ matchup, isActive }: MatchupItemProps) {
  return (
    <div className="w-full h-full">
      <MatchupCard matchup={matchup} isActive={isActive} />
    </div>
  );
}
```

**MatchupCard** updates:
- Added `isActive` prop support (controls video playback)
- Pauses both videos when `isActive={false}`
- Auto-plays active side when `isActive={true}`

**LifestyleItem** (`src/components/feed/LifestyleItem.tsx`):

Daily aggregate carousel with horizontal swipe:
- **User header** - Profile photo, username, streak, date
- **Posts carousel** - Horizontal scroll with snap points
- **Dot indicators** - Shows current slide position
- **Auto-scroll to most recent** - Starts at last post

```typescript
export default function LifestyleItem({ aggregate, isActive }: LifestyleItemProps) {
  // Backend sends posts DESC (newest first), reverse for chronological display
  const postsChronological = [...aggregate.posts].reverse();
  const totalSlides = postsChronological.length;

  // Start at the last slide (most recent post)
  const [currentSlide, setCurrentSlide] = useState(totalSlides - 1);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll to last slide on mount (only once)
  useEffect(() => {
    if (hasScrolledRef.current || totalSlides === 0) return;

    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: slideWidth * (totalSlides - 1),
      behavior: 'auto',
    });

    hasScrolledRef.current = true;
  }, [totalSlides]);

  // IMPORTANT: Guard against empty posts AFTER hooks (Rules of Hooks)
  if (postsChronological.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-full w-full">
      {/* User Header */}
      <div className="flex items-center gap-3">
        <img src={aggregate.profileImageUrl} />
        <div>
          <p>{aggregate.username}</p>
          <p>
            {aggregate.overallStreak > 0 && <span>🔥 {aggregate.overallStreak}</span>}
            {formatDate(aggregate.dayDate)}
          </p>
        </div>
      </div>

      {/* Posts Carousel */}
      <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory">
        {postsChronological.map((post) => (
          <div className="flex-shrink-0 w-full snap-center">
            <LifestyleFeedPost post={post} isCarouselSlide />
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5">
        {postsChronological.map((_, index) => (
          <button
            onClick={() => goToSlide(index)}
            className={index === currentSlide ? 'bg-accent-col' : 'bg-text-col/30'}
          />
        ))}
      </div>
    </div>
  );
}
```

### useUnifiedFeed Hook

**Location**: `src/hooks/useUnifiedFeed.ts`

State management for unified feed with cursor-based pagination:

```typescript
export const useUnifiedFeed = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await feedApi.getMixedFeed({
        limit: 10,
        cursor: nextCursor,
        sport: undefined, // Optional filter
      });

      setItems((prev) => [...prev, ...response.items]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError('Failed to load feed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    setItems([]);
    setNextCursor(null);
    setHasMore(true);
    await loadMore();
  };

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};
```

### Key Patterns & Best Practices

**1. Rules of Hooks Compliance**:
- ✅ All hooks MUST be called before any conditional returns
- ✅ Example: LifestyleItem calls `useEffect()` before checking `if (posts.length === 0)`
- ❌ NEVER place early returns before hooks

**2. IntersectionObserver Memory Management**:
- ✅ Only observe items in buffer range (current ± 2)
- ✅ Disconnect observer on unmount
- ❌ Don't observe ALL items (causes memory leak with 100+ items)

**3. Infinite Loop Prevention**:
- ✅ Add `!error` check to loadMore effect dependencies
- ✅ Only trigger when `hasMore && !isLoading && !error`
- ❌ Don't trigger loadMore if API keeps failing

**4. React Key Uniqueness**:
- ✅ Use composite IDs for transient matchups: `matchup-{id_a}_{id_b}`
- ✅ Backend assigns `id: 0` to transient matchups (not in DB yet)
- ❌ Don't use `matchup-0` as key (causes duplicates)

**5. Buffer Optimization**:
- ✅ Only render items in buffer range (current ± 1)
- ✅ Use placeholder divs to maintain layout for out-of-buffer items
- ✅ Reduces DOM nodes and improves performance

**6. Video Playback Management**:
- ✅ Pause videos when `isActive={false}`
- ✅ Auto-play when `isActive={true}`
- ✅ Handle play() rejection with `.catch()`

**7. SSR Safety**:
- ✅ Use `useState<number | null>(null)` for dimensions
- ✅ Calculate in useEffect with `window` checks
- ❌ Don't access `window` during initial render

### Error States & Recovery

**Empty State**:
```tsx
if (!isLoading && items.length === 0 && !hasMore) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-text-muted-col">No content available</p>
    </div>
  );
}
```

**Error Recovery**:
```tsx
{error && items.length > 0 && (
  <div className="flex flex-col items-center gap-4">
    <Alert variant="error">{error}</Alert>
    <Button onClick={() => loadMore()}>Retry</Button>
  </div>
)}
```

**All Caught Up**:
```tsx
{!hasMore && items.length > 0 && (
  <div className="flex flex-col items-center">
    <p>🎉 You're all caught up!</p>
  </div>
)}
```

## Polymorphic Comments & Reactions

The comments and reactions system uses a **polymorphic architecture** - the same UI components, hooks, and patterns work for BOTH highlights AND lifestyle posts.

### Content Types

```typescript
type ContentType = 'highlight' | 'lifestyle_post';
```

### Shared Components

These components accept `contentType` and `contentId` props and work identically for any content:

- **ReactionPanel** - Top 3 reactions display with "add reaction" button
- **ReactionModal** - Full 8-emoji grid for selecting reactions
- **CommentModal** - Comment list with input, like buttons, pagination
- **CommentItem** - Individual comment with author, like button, delete option

### Usage Pattern

```tsx
// For highlights
<ReactionPanel
  contentType="highlight"
  contentId={highlight.id}
  reactions={reactions}
  onOpenModal={() => setShowReactionModal(true)}
/>

// For lifestyle posts (identical API)
<ReactionPanel
  contentType="lifestyle_post"
  contentId={post.id}
  reactions={reactions}
  onOpenModal={() => setShowReactionModal(true)}
/>
```

### Hooks

```typescript
// Reactions - same hook, different content type
const highlightReactions = useContentReactions('highlight', highlightId);
const lifestyleReactions = useContentReactions('lifestyle_post', postId);

// Comments - same hook, different content type
const highlightComments = useContentComments('highlight', highlightId);
const lifestyleComments = useContentComments('lifestyle_post', postId);
```

### Emoji System

```typescript
// 8 available emojis (stored as string IDs)
const EMOJI_IDS = ['fire', 'hundred', 'shocked', 'anguished', 'laughing', 'crying', 'angry', 'cold'];

// Map IDs to Unicode emojis for display
const EMOJI_MAP: Record<string, string> = {
  fire: '🔥',
  hundred: '💯',
  shocked: '😱',
  anguished: '😧',
  laughing: '😂',
  crying: '😭',
  angry: '😤',
  cold: '🥶',
};
```

### API Endpoints

| Content Type | Reactions | Comments |
|--------------|-----------|----------|
| Highlight | `/highlights/{id}/reactions` | `/highlights/{id}/comments` |
| Lifestyle Post | `/lifestyle-posts/{id}/reactions` | `/lifestyle-posts/{id}/comments` |

> **Mobile Implementation**: See [spotlux-backend/mobile-implementation/content-comments-reactions.md](../spotlux-backend/mobile-implementation/content-comments-reactions.md) for complete specs.

## API Integration

**Configuration** (`src/lib/config.ts`):

- Development: `http://localhost:8000`
- Production: `https://api.spotlux.app`
- Override with `NEXT_PUBLIC_API_URL` environment variable

**Case Conversion** (`src/lib/caseConversion.ts`):
- Backend uses `snake_case`
- Frontend uses `camelCase`
- Automatic conversion utilities for API requests/responses
- **Query Parameters**: Backend middleware automatically converts camelCase query params to snake_case
  - Example: `?searchText=john` → backend receives `?search_text=john`
  - Frontend can use either camelCase or snake_case in query params (both work)
  - No manual conversion needed - handled by backend middleware

**Automatic Timezone Syncing**:
- User timezone automatically synced at three touchpoints:
  1. **Login**: `?timezone={iana_timezone}` query parameter
  2. **Registration**: `timezone` field in request body
  3. **Lifestyle Post Creation**: `X-Timezone` header (daily for active users)
- Uses `Intl.DateTimeFormat().resolvedOptions().timeZone` to get IANA timezone identifier
- Enables accurate lifestyle day calculation (3am cutoff) regardless of user location
- Auto-updates when users travel or move

**API Client Organization** (`src/api/`):
- `auth.ts` - Authentication (login with auto timezone sync, logout, refresh)
- `users.ts` - User profile operations (registration with timezone field)
- `highlights.ts` - Highlight CRUD operations
- `highlightReels.ts` - Reel management (create, update, delete, reorder)
- `reactions.ts` - Content reactions (polymorphic - works for highlights AND lifestyle posts)
  - Includes `EMOJI_IDS` constant and `EMOJI_MAP` for string ID to Unicode emoji conversion
  - Endpoints: `/highlights/{id}/reactions`, `/lifestyle-posts/{id}/reactions`
- `comments.ts` - Content comments (polymorphic - works for highlights AND lifestyle posts)
  - Includes comment CRUD and like/unlike operations
  - Endpoints: `/highlights/{id}/comments`, `/lifestyle-posts/{id}/comments`
- `matchups.ts` - Matchup voting, results, current featured prompt
- `feed.ts` - Unified feed endpoint
  - `getMixedFeed({ limit, cursor, sport })` - Returns `{ items, nextCursor, hasMore }`
  - Handles transient matchup key generation (composite IDs for id=0 matchups)
  - Auto-converts backend format to discriminated union FeedItem types
  - `resetFeedHistory()` - DEV TOOL to clear all viewed content
- `promptCategories.ts` - Prompt category CRUD
- `prompts.ts` - Prompt management
- `conversations.ts` - Messaging/DM API (create, send, mark as read)
- `lifestyle.ts` - Lifestyle tracking API (prompts, posts, aggregates, feed, streaks, calendar, insights)
  - Includes all lifestyle types: LifestylePrompt, LifestylePost, LifestyleDailyAggregate, CalendarDate, WakeTimeInsight, SleepTimeInsight, SleepDurationInsight
  - Methods: getPromptsByCategory, getTodaysPosts, createPost (with X-Timezone header), updatePost, deletePost, getAggregate, getFeed, trackAggregateView, getAllStreaks, getOverallStreak, getCalendar, getWakeTimeInsight, getSleepTimeInsight, getSleepDurationInsight
- `upload.ts` - S3 presigned URL generation
- `friendships.ts` - Friend request/accept/reject
- `friendMatchups.ts` - Friend 1v1 matchup challenges in DMs
  - Types: FriendMatchup, FriendMatchupStatus, FriendMatchupVisibility, CreateFriendMatchupRequest
  - Methods: create, get, respond, decline, vote
  - Used with WebSocket events (matchup.created, matchup.confirmed, matchup.declined, matchup.result)
  - **Voting durations**: `0` (1 min test), `24` (1 day), `72` (3 days), `168` (1 week)
- `teams.ts`, `leagues.ts`, `positions.ts`, `sports.ts` - Sports data

**Utility Functions** (`src/lib/`):
- `dateUtils.ts` - Centralized date/time formatting (ALWAYS use these instead of inline formatting)
  - `formatDate(dateStr)` - "Month Day, Year" format
  - `formatShortDate(dateStr)` - Short locale format (e.g., "1/15/2024")
  - `formatTime(timeStr)` - 12-hour format with AM/PM (e.g., "3:45 PM")
  - `formatDuration(seconds)` - M:SS format for video duration
  - `formatRelativeTime(dateStr)` - Relative time (e.g., "now", "5m", "3h", "2d")

### API Pagination Pattern (Frontend Perspective)

**Offset/Limit Pagination**:

```typescript
// API Interface
export interface GetResourcesParams {
  offset?: number;
  limit?: number;
  searchText?: string;
  // Add resource-specific filters here
}

export const resourcesApi = {
  async getResources(params?: GetResourcesParams): Promise<Resource[]> {
    const queryParams = new URLSearchParams();

    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    if (params?.searchText) queryParams.append("searchText", params.searchText);

    const url = `${config.apiBaseUrl}/api/v1/resources${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return authRequest<Resource[]>(url);
  },
};
```

**Cursor-Based Pagination** (Feed & Matchups):

```typescript
const { items, nextCursor, hasMore } = await feedApi.getMixedFeed({
  limit: 10,
  cursor: previousCursor, // Pass full cursor string
  sport: 'basketball'
});
```

## Real-time Features (WebSocket)

**WebSocketContext** (`src/contexts/WebSocketContext.tsx`):
- Manages WebSocket connection lifecycle
- Auto-connects on authentication
- Auto-reconnects on disconnect
- Handles: new messages, typing indicators, read receipts

**MessagingContext** (`src/contexts/MessagingContext.tsx`):
- Manages messaging state via `useReducer`
- Subscribes to WebSocket events and dispatches state updates
- Handles friend matchup WebSocket events for real-time updates

**Event Types**:
- `message_sent` - New message in conversation
- `typing_start`, `typing_stop` - Typing indicators
- `message_read` - Read receipts
- `matchup.created` - Friend matchup challenge sent (add invite message)
- `matchup.confirmed` - Challenge accepted (update status to active, add system message, includes votingEndsAt)
- `matchup.declined` - Challenge declined (update status, S3 video cleanup on backend)
- `matchup.result` - Voting ended via background job (update status to completed, add results message, includes winnerId, initiatorVotes, responderVotes)

**State Management Pattern**:
```typescript
// MessagingContext reducer actions
type MessagingAction =
  | { type: 'SET_CONVERSATIONS'; conversations: Conversation[] }
  | { type: 'ADD_MESSAGE'; conversationId: number; message: Message }
  | { type: 'UPDATE_MATCHUP_STATUS'; matchupId: number; status: FriendMatchupStatus; votingEndsAt?: string; winnerId?: number; initiatorVotes?: number; responderVotes?: number }
  // ... etc
```

**Duplicate Message Prevention**:
- `ADD_MESSAGE` reducer checks for existing message ID before adding
- Prevents duplicates when both WebSocket event and API response add the same message

**Used by**: `ConversationView`, `MessageInput`, `FriendMatchupMessageBubble`

## Styling Guidelines

**Design Philosophy**:

- Subtle, professional styling (LinkedIn-like aesthetic)
- Minimal color usage, accents sparingly
- Consistent text/icon colors (`text-text-col`)
- All clickable elements have cursor-pointer

**Active States**:

```css
border-l-4 border-accent-col bg-bg-col/30
```

**Hover States**:

```css
/* Standard */
hover:bg-bg-col/50

/* Logout (subtle red) */
hover:bg-bg-col/50 hover:border-l-4 hover:border-red-500/50
```

**Avoid**:

- Bold color changes on hover
- Strong background colors
- Inconsistent text/icon colors
- Overly dramatic effects

**Icons**:

- Always use `iconoir-react` for icons, NOT `lucide-react`
- Common imports: `import { Home, Trophy, User, Bell, ChatLines, Group } from "iconoir-react"`
- Standard size: `className="w-6 h-6"` or `className="w-7 h-7"`
- Standard stroke: `strokeWidth={2}` (active states: `strokeWidth={2.5}`)

## Code Standards

**Page Structure Guidelines**:

- **Keep page.tsx files minimal** - Only routing and layout wrapping (8-12 lines ideal)
- **Move all logic to components** - Business logic, state, hooks belong in `src/components/{feature}/`
- **Split complex components** - Break large pages into focused subcomponents
- **Name page components consistently** - Use `{Feature}Page.tsx` naming convention
- **Colocate related components** - Keep feature components together in feature directories

**Import Guidelines**:

- **Always add imports at the top of files** - Never use inline imports within functions
- **Exception**: Only move imports inline/bottom when absolutely necessary to avoid circular dependencies
- When adding new functionality, add required imports to the top of the file immediately
- Do not add imports inside function bodies unless there is a specific technical reason (document why if you do)

**File Size & Organization Guidelines**:

- **Target file size**: Keep component files under 300 lines
- **Signs a file needs splitting**:
  - File exceeds 400 lines
  - Multiple distinct UI sections that could be subcomponents
  - Repeated JSX patterns that could be extracted
  - Complex state logic that could move to a custom hook
- **Refactoring approach**:
  1. Extract repeated patterns into helper functions or subcomponents
  2. Move complex state/effects into custom hooks (`src/hooks/`)
  3. Split large components into focused subcomponents in same directory
  4. Keep API logic in `src/api/` files, not inline in components

**Custom Hooks Pattern**:

When component state logic gets complex, extract to a custom hook:
```typescript
// Before: 50+ lines of state/effects in component
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... complex fetch/update logic

// After: Clean component, reusable hook
const { items, loading, error, loadMore } = useUnifiedFeed();
```

**Existing hooks** (`src/hooks/`):
- `useUnifiedFeed.ts` - Feed state and pagination
- `useMatchupVoting.ts` - Matchup vote handling
- `useContentReactions.ts` - Polymorphic reactions
- `useContentComments.ts` - Polymorphic comments
- `useImageCrop.ts` - Image cropping state

## Testing

**Frontend**: No test framework currently configured

## Environment Configuration

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

## Production Deployment

### Frontend Deployment

- Build: `npm run build`
- Deploy built artifacts from `.next/` directory
- Set `NEXT_PUBLIC_API_URL` to production API URL

## Key Dependencies

### Frontend

- `next@15.5.3`
- `react@19.1.0`
- `tailwindcss@^4`
- `typescript@^5`
- `iconoir-react` (icon library)
- `heic2any` (HEIC/HEIF to JPEG conversion)
- `browser-image-compression` (client-side image compression)

## API Endpoints Reference

> **Note**: For complete API endpoint documentation and implementation details, see [../spotlux-backend/CLAUDE.md](../spotlux-backend/CLAUDE.md)

**Key Endpoints**:
- Authentication: `/api/v1/login`, `/api/v1/logout`, `/api/v1/refresh`
- Users: `/api/v1/users`, `/api/v1/user/sports`, `/api/v1/user/teams`
- Highlights: `/api/v1/highlights`, `/api/v1/highlight-reels`, `/api/v1/feed`
- Highlight Interactions: `/api/v1/highlights/{id}/reactions`, `/api/v1/highlights/{id}/comments`
- Matchups: `/api/v1/highlight-matchups`, `/api/v1/highlight-matchups/vote`
- Lifestyle: `/api/v1/lifestyle-posts`, `/api/v1/lifestyle-feed`, `/api/v1/lifestyle-streaks`, `/api/v1/users/{user_id}/lifestyle/calendar`, `/api/v1/lifestyle/insights/*`
- Lifestyle Interactions: `/api/v1/lifestyle-posts/{id}/reactions`, `/api/v1/lifestyle-posts/{id}/comments`
- Social: `/api/v1/friendships`, `/api/v1/conversations`
- Friend Matchups: `/api/v1/friend-matchups`, `/api/v1/friend-matchups/{id}/respond`, `/api/v1/friend-matchups/{id}/decline`, `/api/v1/friend-matchups/{id}/vote`
- Upload: `/api/v1/upload`

## Mobile Implementation Reference

> **Note**: For React Native mobile implementation specs, see [../spotlux-backend/mobile-implementation/](../spotlux-backend/mobile-implementation/)
