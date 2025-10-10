import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Valid ESPN abbreviations list
const VALID_ABBRS = new Set([
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SEA','SF','TB','TEN','WSH'
]);

// Map normalized full names and common variants to abbreviations
const NAME_TO_ABBR: Record<string, string> = {
  'arizona cardinals': 'ARI',
  'atlanta falcons': 'ATL',
  'baltimore ravens': 'BAL',
  'buffalo bills': 'BUF',
  'carolina panthers': 'CAR',
  'chicago bears': 'CHI',
  'cincinnati bengals': 'CIN',
  'cleveland browns': 'CLE',
  'dallas cowboys': 'DAL',
  'denver broncos': 'DEN',
  'detroit lions': 'DET',
  'green bay packers': 'GB',
  'houston texans': 'HOU',
  'indianapolis colts': 'IND',
  'jacksonville jaguars': 'JAX',
  'kansas city chiefs': 'KC',
  'las vegas raiders': 'LV',
  'los angeles chargers': 'LAC',
  'la chargers': 'LAC',
  'los angeles rams': 'LAR',
  'la rams': 'LAR',
  'miami dolphins': 'MIA',
  'minnesota vikings': 'MIN',
  'new england patriots': 'NE',
  'new orleans saints': 'NO',
  'new york giants': 'NYG',
  'ny giants': 'NYG',
  'new york jets': 'NYJ',
  'ny jets': 'NYJ',
  'philadelphia eagles': 'PHI',
  'pittsburgh steelers': 'PIT',
  'san francisco 49ers': 'SF',
  '49ers': 'SF',
  'niners': 'SF',
  'seattle seahawks': 'SEA',
  'tampa bay buccaneers': 'TB',
  'tennessee titans': 'TEN',
  'washington commanders': 'WSH',
  'washington': 'WSH',
};

// Map nicknames to abbreviations as a helper
const NICK_TO_ABBR: Record<string, string> = {
  'cardinals': 'ARI',
  'falcons': 'ATL',
  'ravens': 'BAL',
  'bills': 'BUF',
  'panthers': 'CAR',
  'bears': 'CHI',
  'bengals': 'CIN',
  'browns': 'CLE',
  'cowboys': 'DAL',
  'broncos': 'DEN',
  'lions': 'DET',
  'packers': 'GB',
  'texans': 'HOU',
  'colts': 'IND',
  'jaguars': 'JAX',
  'chiefs': 'KC',
  'raiders': 'LV',
  'chargers': 'LAC',
  'rams': 'LAR',
  'dolphins': 'MIA',
  'vikings': 'MIN',
  'patriots': 'NE',
  'saints': 'NO',
  'giants': 'NYG',
  'jets': 'NYJ',
  'eagles': 'PHI',
  'steelers': 'PIT',
  'seahawks': 'SEA',
  'buccaneers': 'TB',
  'bucs': 'TB',
  'titans': 'TEN',
  'commanders': 'WSH',
};

function normalize(s: string) {
  return s.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/\s+/g, ' ').trim();
}

function resolveAbbr(input?: string | null): string | null {
  if (!input) return null;
  const raw = input.trim();
  // If already an abbreviation
  const maybeAbbr = raw.toUpperCase();
  if (maybeAbbr.length <= 3 && VALID_ABBRS.has(maybeAbbr)) return maybeAbbr;

  const n = normalize(raw);
  // Full name first
  if (NAME_TO_ABBR[n]) return NAME_TO_ABBR[n];
  // Try last word as nickname
  const parts = n.split(' ');
  const last = parts[parts.length - 1];
  if (NICK_TO_ABBR[last]) return NICK_TO_ABBR[last];
  // Try removing city prefixes like 'los angeles', 'new york', 'san francisco'
  const knownPrefixes = [
    'los angeles','la','new york','ny','san francisco','san','las vegas','las','green bay','jacksonville','kansas city','tampa bay','washington'
  ];
  for (const p of knownPrefixes) {
    if (n.startsWith(p + ' ')) {
      const rest = n.substring(p.length + 1);
      if (NAME_TO_ABBR[n]) return NAME_TO_ABBR[n];
      if (NICK_TO_ABBR[rest]) return NICK_TO_ABBR[rest];
    }
  }
  return null;
}

interface TeamLogoProps {
  teamName: string;
  size?: number;
  isPicked?: boolean;
}

export default function TeamLogo({ teamName, size = 40, isPicked = false }: TeamLogoProps) {
  // Resolver abreviatura usando la lógica robusta
  const abbr = resolveAbbr(teamName);
  
  if (!abbr) {
    return (
      <View style={[styles.logoContainer, { width: size, height: size }, isPicked && styles.pickedBorder]}>
        <View style={[styles.placeholder, { width: size - 8, height: size - 8 }]} />
      </View>
    );
  }

  // URL del logo en la API de ESPN usando la abreviatura
  const logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;

  return (
    <View style={[styles.logoContainer, { width: size, height: size }, isPicked && styles.pickedBorder]}>
      <Image
        source={{ uri: logoUrl }}
        style={[styles.logo, { width: size - 8, height: size - 8 }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logo: {
    borderRadius: 4,
  },
  placeholder: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  pickedBorder: {
    borderWidth: 3,
    borderColor: '#4F46E5',
    borderRadius: 28,
  },
});
