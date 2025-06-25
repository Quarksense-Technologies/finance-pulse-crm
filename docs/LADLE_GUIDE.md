
# Ladle Visual Component Editor

Ladle is set up for visual component development and testing. It provides a fast, lightweight alternative to Storybook for developing and documenting React components.

## Getting Started

### Running Ladle

```bash
# Start the Ladle development server
npm run ladle:serve

# Build static Ladle files
npm run ladle:build

# Preview built Ladle files
npm run ladle:preview
```

### Writing Stories

Stories are located alongside components with the `.stories.tsx` extension. Here's the basic structure:

```typescript
import type { Story } from "@ladle/react";
import { YourComponent } from "./YourComponent";

export const Default: Story = () => <YourComponent />;

export const WithProps: Story = () => (
  <YourComponent prop1="value" prop2={true} />
);

Default.meta = {
  title: "Category/ComponentName",
};
```

### Story Organization

- **UI Components**: `src/components/ui/*.stories.tsx`
- **Feature Components**: `src/components/[feature]/*.stories.tsx`
- **Layout Components**: `src/components/Layout.stories.tsx`
- **Pages**: `src/pages/*.stories.tsx`

### Features Available

1. **Theme Toggle**: Switch between light and dark themes
2. **Controls**: Interactive controls for component props
3. **Source Code**: View the source code of stories
4. **Responsive**: Test components at different screen sizes

### Best Practices

1. **Keep Stories Simple**: Focus on one aspect per story
2. **Use Descriptive Names**: Make story names clear and descriptive
3. **Group Related Stories**: Use the `meta.title` to organize stories
4. **Test Edge Cases**: Create stories for loading, error, and empty states
5. **Document Props**: Use TypeScript for automatic prop documentation

### Example Stories to Create

- Form components with validation states
- Loading and error states
- Different data scenarios
- Mobile and desktop layouts
- Dark and light theme variations

### Troubleshooting

If you encounter issues:

1. Check that all imports are correct
2. Ensure TypeScript types are properly defined
3. Verify that mock data is provided for API-dependent components
4. Check the browser console for errors

### Configuration

Ladle configuration is in `.ladle/config.mjs`. Key features:

- Auto-discovery of story files
- Tailwind CSS support
- Path alias configuration
- Theme switching
- Control panel
