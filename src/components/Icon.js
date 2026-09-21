import React from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * Centralized Font Awesome icon wrapper — see ICON_MIGRATION.md at the repo root.
 * All UI icons should go through this component instead of importing
 * FontAwesome6 (or any glyph) directly, so the icon set can be swapped in one place.
 */
export default function Icon({ name, size = 18, color = colors.white, style, ...rest }) {
  return <FontAwesome6 name={name} size={size} color={color} style={style} {...rest} />;
}
