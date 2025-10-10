// NFL MVPicks Theme Constants
// Basado en los colores de la versión web

export const COLORS = {
  // Primary Colors - Blue Gradient (MÁS CLAROS)
  primary: '#004B9B',        // Azul más claro
  primaryDark: '#003D7A',    // Azul medio
  primaryLight: '#0066CC',   // Azul claro
  
  // Gradient colors for headers (MÁS CLAROS)
  gradientStart: '#0066CC', // Azul claro
  gradientEnd: '#66B3FF',   // Azul muy claro
  
  // Secondary Colors
  secondary: '#FFFFFF',
  accent: '#FFD700', // Gold
  
  // Text Colors
  textPrimary: '#002C5F',
  textSecondary: '#666666',
  textLight: '#FFFFFF',
  textDark: '#1A1A1A',
  
  // Background Colors
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundDark: '#E9ECEF',
  backgroundOverlay: 'rgba(0, 102, 204, 0.75)', // Azul más claro para overlay
  
  // Status Colors
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  
  // Border Colors
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 75, 155, 0.1)', // Sombra azul más clara
  
  // Pick status colors
  pickCorrect: '#22C55E',
  pickIncorrect: '#EF4444',
  pickTie: '#4F46E5',
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Font Sizes
  fontXS: 10,
  fontSM: 12,
  fontMD: 14,
  fontLG: 16,
  fontXL: 18,
  fontXXL: 20,
  fontXXXL: 24,
  
  // Border Radius
  radiusXS: 4,
  radiusSM: 8,
  radiusMD: 12,
  radiusLG: 16,
  radiusXL: 20,
  radiusRound: 999,
  
  // Component Sizes
  headerHeight: 100,
  avatarSize: 40,
  logoHeight: 32,
  buttonHeight: 48,
  inputHeight: 48,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  regular: {
    fontWeight: '400' as const,
  },
  medium: {
    fontWeight: '500' as const,
  },
  semiBold: {
    fontWeight: '600' as const,
  },
  bold: {
    fontWeight: '700' as const,
  },
};

export default {
  COLORS,
  SIZES,
  SHADOWS,
  FONTS,
};
